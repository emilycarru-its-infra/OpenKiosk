// SB header file
#include "mozOpenKioskLinux.h"

#include "nsIFile.h"
#include "nsThreadUtils.h"
#include "nsServiceManagerUtils.h"
#include "nsIPrefService.h"
#include "nsIPrefBranch.h"

#include <stdio.h>

// Run GSETTINGS Script
class GSRunnable final : public mozilla::Runnable
{
  public:
    GSRunnable(const nsAString & aMsg) :
      mozilla::Runnable("GSRunnable"),
      mMsg(aMsg)
    {
      MOZ_ASSERT(!NS_IsMainThread()); // This should be running on the worker thread

      // printf("-------- MSG [%s] --------\n", NS_ConvertUTF16toUTF8(mMsg).get());
    }

    NS_IMETHOD Run()
    {
      MOZ_ASSERT(NS_IsMainThread()); // This method is supposed to run on the main thread!

      int retval;

      nsCOMPtr<nsIDirectoryServiceProvider> ds = do_GetService("@mozilla.org/file/directory_service;1");
      nsCOMPtr<nsIFile> dir;

      nsresult rv;
      bool unused;
      rv = ds->GetFile("CurProcD", &unused, getter_AddRefs(dir));
      if (NS_FAILED(rv)) return rv;

      nsCOMPtr<nsIFile> parent;
      rv = dir->GetParent(getter_AddRefs(parent));
      if (NS_FAILED(rv)) return rv;

      nsAutoString path;
      parent->GetPath(path);

      // printf("-------- PATH [%s] --------\n", NS_ConvertUTF16toUTF8(path).get());

      nsAutoCString dconf, gsettings;

      dconf.Assign(NS_ConvertUTF16toUTF8(path));
      gsettings.Assign(NS_ConvertUTF16toUTF8(path));

      if (mMsg.Equals(NS_LITERAL_STRING_FROM_CSTRING("START")))
      {
        printf("-------- GSETTINGS LOCK --------\n");
  
        dconf.Append("/./dconf.sh write &");
        gsettings.Append("/./gsettings.sh start &");

        printf("-------- DCONF [%s] --------\n", dconf.get());
        printf("-------- GSETTINGS [%s] --------\n", gsettings.get());

        retval = system(dconf.get());
        retval = system(gsettings.get());
      }
        else
      {
        printf("-------- GSETTINGS UNLOCK --------\n");

        dconf.Append("/./dconf.sh write &");
        gsettings.Append("/./gsettings.sh stop &");

        retval = system(dconf.get());
        retval = system(gsettings.get());
      }

      return NS_OK;
    }

  private:
    nsAutoString mMsg;
};

NS_IMPL_ISUPPORTS(mozOpenKiosk, nsIObserver, mozIOpenKiosk)

nsresult
mozOpenKiosk::Create(REFNSIID aIID, void** aResult)
{
  RefPtr<mozOpenKiosk> ok = new mozOpenKiosk();
  return ok->QueryInterface(aIID, aResult);
}


mozOpenKiosk::mozOpenKiosk() :
    mOS(nullptr)
{
  printf("-------- mozOpenKiosk::CREATE --------\n");
  mOS = do_GetService("@mozilla.org/observer-service;1");
}

mozOpenKiosk::~mozOpenKiosk()
{
  printf("-------- mozOpenKiosk::DESTROY --------\n");
}

NS_IMETHODIMP
mozOpenKiosk::SetOpenKioskUIMode(bool aIsAdmin)
{
  printf("-------- mozOpenKiosk::SetOpenKioskUIMode --------\n");

  if (aIsAdmin) Enable();
  else Disable();

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::KillExplorer()
{
  return NS_OK;
}

void
mozOpenKiosk::Enable()
{
  Log("Enable");

  nsCOMPtr<nsIRunnable> runnable = new GSRunnable(NS_LITERAL_STRING_FROM_CSTRING("END"));
  NS_DispatchBackgroundTask(runnable);
}

void
mozOpenKiosk::Disable()
{
  Log("LockScreen");

   nsCOMPtr<nsIRunnable> runnable = new GSRunnable(NS_LITERAL_STRING_FROM_CSTRING("START"));
   NS_DispatchBackgroundTask(runnable.forget());
}

NS_IMETHODIMP
mozOpenKiosk::AddObservers()
{
  if (mOS)
  {
    nsresult rv = mOS->AddObserver(this, "openkiosk-window-deactivated", false);
    if (NS_SUCCEEDED(rv)) printf("ADD WINDOW OBSERVER SUCCESS!\n");

    rv = mOS->AddObserver(this, "openkiosk-quit", false);
    if (NS_SUCCEEDED(rv)) printf("ADD QUIT OBSERVER SUCCESS!\n");
  }

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::RemoveObservers()
{
  if (mOS)
  {
    nsresult rv = mOS->RemoveObserver(this, "openkiosk-window-deactivated");
    if (NS_SUCCEEDED(rv)) printf("REMOVE WINDOW OBSERVER SUCCESS!\n");

    rv = mOS->RemoveObserver(this, "openkiosk-quit");
    if (NS_SUCCEEDED(rv)) printf("REMOVE QUIT OBSERVER SUCCESS!\n");
  }

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::Observe(nsISupports* aSubject, const char* aTopic, const char16_t* aData)
{
  Log(aTopic);

  if (!strcmp(aTopic, "openkiosk-window-deactivated"))
  {
    bool externalApps = false;

    nsCOMPtr<nsIPrefBranch> prefs(do_GetService(NS_PREFSERVICE_CONTRACTID));

    if (prefs) prefs->GetBoolPref("openkiosk.admin.externalapps.enabled", &externalApps);

    if (!externalApps)
    {
      Log("BREACH OBSERVED!");
      nsCOMPtr<nsIObserverService> os = do_GetService("@mozilla.org/observer-service;1");
      if (os) os->NotifyObservers(nullptr, "openkiosk-security-breach", nullptr);
    }
  }

  if (!strcmp(aTopic, "quit-application"))
  {
    Log("QUIT OBSERVED!");
    RemoveObservers();
  }

  return NS_OK;
}

void
mozOpenKiosk::PrintPointer(const char* aName, nsISupports* aPointer)
{
  printf ("%s (%p)\n", aName, (void*)aPointer);
}

void
mozOpenKiosk::Log(const char* aMsg)
{
  printf ("OPENKIOSK:MODULE: %s\n", aMsg);
}

