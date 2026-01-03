
#include "mozOpenKioskWin.h"

#include <windows.h>
#include <tlhelp32.h>
#include <VersionHelpers.h>
#include <stdio.h>

#include "nsString.h"
#include "nsUnicharUtils.h"

nsresult
mozOpenKiosk::Create(REFNSIID aIID, void** aResult)
{
  RefPtr<mozOpenKiosk> ok = new mozOpenKiosk();
  return ok->QueryInterface(aIID, aResult);
}

mozOpenKiosk::mozOpenKiosk()
{
  printf("-------- mozOpenKiosk::CREATE --------\n");
  mPrefs = do_GetService(NS_PREFSERVICE_CONTRACTID);
}

mozOpenKiosk::~mozOpenKiosk() 
{
  printf("-------- mozOpenKiosk::DESTROY --------\n");
}

NS_IMPL_ISUPPORTS(mozOpenKiosk, mozIOpenKiosk)


NS_IMETHODIMP
mozOpenKiosk::SetOpenKioskUIMode(bool aIsAdmin)
{
  HWND hwnd = FindWindow(L"Shell_traywnd", NULL);

  if (!aIsAdmin)
  {
    Log("******** LOCK ********");

    HandleExplorer(true);
    ShowWindow(hwnd, SW_HIDE); // hide it
    EnableWindow(hwnd, FALSE); // disable it
    EnableWindow(FindWindowEx(hwnd, 0, L"Button", NULL), FALSE); // disable it

    if (IsWindowsVistaOrGreater())
    {
      HWND startOrb = FindWindowEx(NULL, NULL, MAKEINTATOM(0xC017), NULL);
      ShowWindow(startOrb, SW_HIDE); // Hide Vista Start Orb
    }
  }
    else
  {
    Log("******** UNLOCK ********");

    HandleExplorer(false);
    ShowWindow(hwnd, SW_SHOW); // show it
    EnableWindow(hwnd, TRUE);  // enable it
    EnableWindow(FindWindowEx(hwnd, 0, L"Button", NULL), TRUE); // enable it
    ShowWindow(FindWindowEx(hwnd, 0, L"Button", NULL), SW_SHOW);

    if (IsWindowsVistaOrGreater())
    {
      HWND startOrb = FindWindowEx(NULL, NULL, MAKEINTATOM(0xC017), NULL);
      ShowWindow(startOrb, SW_SHOW); // Show Vista Start Orb
    }
  }

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::KillExplorer()
{
  HandleExplorer(true);
  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::AddObservers()
{
  /******
  if (mOS)
  {
    nsresult rv = mOS->AddObserver(this, "openkiosk-window-deactivated", false);
    if (NS_SUCCEEDED(rv)) printf("ADD WINDOW OBSERVER SUCCESS!\n");

    rv = mOS->AddObserver(this, "openkiosk-quit", false);
    if (NS_SUCCEEDED(rv)) printf("ADD QUIT OBSERVER SUCCESS!\n");
  }
  ******/

  return NS_OK;
}

NS_IMETHODIMP
mozOpenKiosk::RemoveObservers()
{
  return NS_OK;
}

void 
mozOpenKiosk::HandleExplorer (bool aDisable)
{
  printf("HandleExplorer:KILL: [%s]\n", !aDisable?"ENABLE":"KILL");

  if (!IsWindows8OrGreater()) return;

  bool explorerIsRunning = false;

  HANDLE hProcess, hSnapshot;
  PROCESSENTRY32 ProcessEntry;
  BOOL moreproc = FALSE;

  hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPALL, 0);

  if (hSnapshot == (HANDLE)-1) return;

  ProcessEntry.dwSize = sizeof(ProcessEntry);
  moreproc = Process32First(hSnapshot, &ProcessEntry);

  while (moreproc)
  {
    hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, ProcessEntry.th32ProcessID);

    if (hProcess == NULL)
    {
      moreproc = Process32Next(hSnapshot, &ProcessEntry);
      continue;
    }

    nsAutoString pname(ProcessEntry.szExeFile);
    pname.StripWhitespace();
    ToLowerCase(pname);

    bool match = pname.Equals(NS_LITERAL_STRING_FROM_CSTRING("explorer.exe"));

    // printf("[%s]==[%s] MATCH(%s)\n", ProcessEntry.szExeFile, NS_ConvertUTF16toUTF8(pname).get(), match ? "TRUE" : "FALSE");

    if (match)
    {
      explorerIsRunning = true;

      printf("PROCESS MATCH FOUND [explorer.exe]\n");

      if (aDisable)
      {
        if (TerminateProcess(hProcess, 1))
          printf("explorer.exe was terminated\n");
        else
          printf("explorer.exe was NOT terminated\n");
      }
    }

    CloseHandle(hProcess);
    moreproc = Process32Next(hSnapshot, &ProcessEntry);
  }

  if (!aDisable && !explorerIsRunning)
  {
    printf("Start Process [explorer.exe] (not running)\n");

    STARTUPINFOW si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));

    CreateProcessW(L"C:\\Windows\\explorer.exe", nullptr, nullptr, nullptr, FALSE, DETACHED_PROCESS, nullptr, nullptr, &si, &pi);
  }
}

void
mozOpenKiosk::Log(const char* aMsg)
{
  printf ("OPENKIOSK:MODULE: %s\n", aMsg);
}

