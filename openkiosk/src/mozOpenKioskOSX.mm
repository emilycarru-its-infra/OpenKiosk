#include "mozOpenKioskOSX.h"

// Mozilla includes
#include "nsIClassInfoImpl.h"

#include <Carbon/Carbon.h>

NS_IMPL_ISUPPORTS(mozOpenKiosk, nsIObserver, mozIOpenKiosk)

nsresult
mozOpenKiosk::Create(REFNSIID aIID, void** aResult)
{
  RefPtr<mozOpenKiosk> ok = new mozOpenKiosk();
  return ok->QueryInterface(aIID, aResult);
}

mozOpenKiosk::mozOpenKiosk() :
  mPrefs(nullptr),
  mAdminMode(false)
{
  Log("CREATE");

  mPrefs = do_GetService(NS_PREFSERVICE_CONTRACTID);
  mOS = do_GetService("@mozilla.org/observer-service;1");
}

mozOpenKiosk::~mozOpenKiosk() 
{
  Log("DESTROY");
}

NS_IMETHODIMP
mozOpenKiosk::SetOpenKioskUIMode(bool aIsAdmin)
{ 
  mAdminMode = aIsAdmin;
  
  if (!aIsAdmin)
  {
    Log("LOCK SYSTEM UI");

    [[NSWorkspace sharedWorkspace] hideOtherApplications];

    NSApplicationPresentationOptions options =
                        NSApplicationPresentationHideDock                   |
                        NSApplicationPresentationDisableAppleMenu           |
                        NSApplicationPresentationDisableProcessSwitching    |
                        NSApplicationPresentationDisableSessionTermination  |
                        NSApplicationPresentationDisableForceQuit           |
                        NSApplicationPresentationDisableHideApplication     |
                        NSApplicationPresentationHideMenuBar;

    [NSApp setPresentationOptions:options];

    if (mPrefs) 
    {
      bool multi;
      mPrefs->GetBoolPref("openkiosk.admin.multimonitor.enabled", &multi);

      /**
       * HIDE ALL OTHER APPS 
       * IF MULITMONITOR MODE 
       * IS NOT ENABLED
       */

      if (!multi)
      {
        [[NSWorkspace sharedWorkspace] hideOtherApplications];
        [[NSRunningApplication currentApplication] unhide];
      }
    }
  }
    else
  {
    Log("UNLOC SYSTEM UI");
    SetSystemUIMode(kUIModeNormal, 0);
  }

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::KillExplorer()
{
  return NS_OK;
}

/**
 * HIDE OTHER APP
 * WHEN DEACTIVATED
 * AND REFOCUS WINDOW
 */

NS_IMETHODIMP
mozOpenKiosk::Observe(nsISupports* aSubject, const char* aTopic, const char16_t* aData)
{
  if (!strcmp(aTopic, "openkiosk-window-deactivated"))
  {
    if (mAdminMode) return NS_OK;
    
    if (mPrefs) 
    {
      bool multi, externalApps;
      mPrefs->GetBoolPref("openkiosk.admin.multimonitor.enabled", &multi);
      mPrefs->GetBoolPref("openkiosk.admin.externalapps.enabled", &externalApps);

      /**
       * UNHIDE ALL OTHER APPS 
       * IF MULITMONITOR MODE 
       * IS NOT ENABLED
       */
  
      if (!multi && !externalApps)
      {
        Log("BREACH OBSERVED!");

        [[NSWorkspace sharedWorkspace] hideOtherApplications];
        [[NSRunningApplication currentApplication] unhide];

        nsCOMPtr<nsIObserverService> os = do_GetService("@mozilla.org/observer-service;1");
        if (os) os->NotifyObservers(nullptr, "openkiosk-security-breach", nullptr);
      }
    }
  }

  if (!strcmp(aTopic, "quit-application"))
  {
    Log("QUIT OBSERVED!");

    if (mPrefs) 
    {
      bool multi;
      mPrefs->GetBoolPref("openkiosk.admin.multimonitor.enabled", &multi);

      /**
       * UNHIDE ALL OTHER APPS 
       * IF MULITMONITOR MODE 
       * IS NOT ENABLED
       */
  
      if (!multi)
      {
        for (NSRunningApplication *currApp in [[NSWorkspace sharedWorkspace] runningApplications])
        {
          bool match = ([[currApp localizedName] rangeOfString:@"(null)" options:NSCaseInsensitiveSearch].location != NSNotFound);
  
          if (!match && ![[currApp localizedName] isEqualToString:@"OpenKiosk"])
          {
            if ([currApp isHidden])
            {
              [currApp unhide];
              NSLog(@"UNHIDING: %@", [currApp localizedName]);
            }
          }
        }
      }
    }
    RemoveObservers();
  }

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::AddObservers()
{
  if (mOS)
  {
    nsresult rv = mOS->AddObserver(this, "openkiosk-window-deactivated", false);
    if (NS_SUCCEEDED(rv)) Log("ADD DEACTIVATE OBSERVER");

    rv = mOS->AddObserver(this, "quit-application", false);
    if (NS_SUCCEEDED(rv)) Log("ADD QUIT OBSERVER");
  }

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::RemoveObservers()
{
  if (mOS)
  {
    nsresult rv = mOS->RemoveObserver(this, "openkiosk-window-deactivated");
    if (NS_SUCCEEDED(rv)) Log("REMOVE DEACTIVATE OBSERVER");

    rv = mOS->RemoveObserver(this, "quit-application");
    if (NS_SUCCEEDED(rv)) Log("REMOVE QUIT OBSERVER");
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

