// START:SECURE BROWSER
#define HKCU HKEY_CURRENT_USER

STICKYKEYS g_StartupStickyKeys = {sizeof(STICKYKEYS), 0};
TOGGLEKEYS g_StartupToggleKeys = {sizeof(TOGGLEKEYS), 0};
FILTERKEYS g_StartupFilterKeys = {sizeof(FILTERKEYS), 0};

HIGHCONTRAST g_StartupHighContrast = {sizeof(HIGHCONTRAST), 0};

// MOUSEKEYS g_StartupMouseKeys;
MOUSEKEYS g_StartupMouseKeys = {sizeof(MOUSEKEYS), 0};

HHOOK g_Hook = NULL;
bool g_IsSet = false;
bool g_TMWasSet = false;
bool g_SessionLockWasSet = false;
bool g_SessionLockKey = false;
bool g_HideFastUserWasSet = false;
bool g_WinKeyDown = false;
DWORD g_HideFastUser;
DWORD g_TMVal;

char G_CONFIGURATION[2048];

// #define DEBUG_PETE

LRESULT CALLBACK LowLevelKeyboardProc (INT nCode, WPARAM wParam, LPARAM lParam)
{
    // By returning a non-zero value from the hook procedure, the
    // message does not get passed to the target window
    KBDLLHOOKSTRUCT *pkbhs = (KBDLLHOOKSTRUCT *) lParam;
    BOOL bControlKeyDown = 0;
    BOOL bShiftKeyDown = 0;
    BOOL bMenuKeyDown = 0;
    BOOL bLMenuKeyDown = 0;
    BOOL bRMenuKeyDown = 0;

    // printf("-------- WIN KEY DOWN [%s] --------\n", g_WinKeyDown ? "TRUE" : "FALSE");

    switch (nCode)
    {
        case HC_ACTION:
        {
            // Check to see if the CTRL key is pressed
            bControlKeyDown = (GetAsyncKeyState(VK_CONTROL) & 0x8000);

            // Check to see if the SHIFT key is pressed
            bShiftKeyDown = (GetAsyncKeyState(VK_SHIFT) & 0x8000);

            // Check to see if the ALT key is pressed
            bMenuKeyDown = (GetAsyncKeyState(VK_MENU) & 0x8000);

            // Check to see if the LEFT ALT key is pressed
            bLMenuKeyDown = (GetAsyncKeyState(VK_LMENU) & 0x8000);

            // Check to see if the RIGHT ALT key is pressed
            bRMenuKeyDown = (GetAsyncKeyState(VK_RMENU) & 0x8000);

            // printf("-------- KEYCODE (0x%02X) --------\n", pkbhs->vkCode);
            // printf("-------- ALT DOWN (%s) --------\n", bMenuKeyDown ? "TRUE" : "FALSE");
            // printf("-------- L_ALT DOWN (%s) --------\n", bLMenuKeyDown ? "TRUE" : "FALSE");
            // printf("-------- R_ALT DOWN (%s) --------\n", bRMenuKeyDown ? "TRUE" : "FALSE");

            // Disable CTRL+ESC
            if (pkbhs->vkCode == VK_ESCAPE && bControlKeyDown)
                return 1;

            // Disable ALT+TAB
            if ( (GetKeyState(VK_LMENU) & 0x8000) && pkbhs->vkCode == VK_TAB)
            {
              printf("-------- PARENT PROCESS (%s) --------\n", XRE_IsParentProcess()?"TRUE":"FALSE");

              bool showChrome = Preferences::GetBool("securebrowser.mode.showChrome");
              bool permissive = Preferences::GetBool("securebrowser.mode.permissive");

              // printf("-------- ALT+TAB PERMISSIVE (%s) SHOWCHROME (%s) --------\n", permissive?"TRUE":"FALSE", showChrome?"TRUE":"FALSE");

              return showChrome || permissive ? 0 : 1;
            }

            // Disable ALT+TAB
            if ( (GetKeyState(VK_RMENU) & 0x8000) && pkbhs->vkCode == VK_TAB)
                return 1;

            // Disable ALT+TAB
            if (pkbhs->vkCode == VK_TAB && pkbhs->flags & LLKHF_ALTDOWN)
                return 1;

            // Disable ALT+TAB
            if (pkbhs->vkCode == VK_TAB && pkbhs->flags & LLKHF_ALTDOWN)
                return 1;

            // Disable ALT+ESC
            if (pkbhs->vkCode == VK_ESCAPE && pkbhs->flags & LLKHF_ALTDOWN)

                return 1;

            // Disable ALT+ESC
            if (pkbhs->vkCode == VK_ESCAPE && (bMenuKeyDown || bLMenuKeyDown || bRMenuKeyDown))
                return 1;

            // Disable LEFT WIN KEY & BREAK
            if (pkbhs->vkCode == VK_PAUSE)
                return 1;

            // Disable KEY & G (Game Bar)
            if (g_WinKeyDown && pkbhs->vkCode == 0x47)
            {
                // printf("-------- BLOCK GAME BAR --------\n");
                return 1;
            }

            // Disable Ctrl+VK_SNAPSHOT
            if (pkbhs->vkCode == VK_SNAPSHOT && bControlKeyDown)
            {
                // printf("-------- BLOCK CTRL+VK_SNAPSHOT --------\n");
                return 1;
            }

            // Disable VK_SNAPSHOT
            if (pkbhs->vkCode == VK_SNAPSHOT)
            {
                // printf("-------- BLOCK VK_SNAPSHOT --------\n");
                return 1;
            }

            // Disable Ctrl+F4
            if (pkbhs->vkCode == VK_F4 && bControlKeyDown)
                return 1;

            // Disable ALT+F4
            if (pkbhs->vkCode == VK_F4 && bMenuKeyDown)
                return 1;

            // Disable ALT+SPACE
            if (pkbhs->vkCode == VK_SPACE && bMenuKeyDown)
                return 1;

            // Disable CTRL+ALT+TAB
            if (pkbhs->vkCode == VK_TAB && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable SHIFT ESCAPE
            if (pkbhs->vkCode == VK_ESCAPE && bShiftKeyDown)
                return 1;

            // printf("-------- L_ALT(%s) L_SHIFT(%s) --------\n", bLMenuKeyDown?"TRUE":"FALSE", bShiftKeyDown?"TRUE":"FALSE");
            // Disable LEFT ALT+LEFT SHIFT+PRINT SCREEN
            if (pkbhs->vkCode == VK_SNAPSHOT && bLMenuKeyDown && bShiftKeyDown)
            {
                // printf("-------- BLOCK HIGH CONTRAST --------\n");
                return 1;
            }

            // Disable CTRL+ALT+LEFT ARROW
            if (pkbhs->vkCode == VK_LEFT && bMenuKeyDown && bControlKeyDown)

            {
                // printf("-------- BLOCK HIGH CONTRAST --------\n");
                return 1;
            }

            // Disable CTRL+ALT+LEFT ARROW
            if (pkbhs->vkCode == VK_LEFT && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable CTRL+ALT+UP ARROW
            if (pkbhs->vkCode == VK_UP && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable CTRL+ALT+RIGHT ARROW
            if (pkbhs->vkCode == VK_RIGHT && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable CTRL+ALT+DOWN ARROW
            if (pkbhs->vkCode == VK_DOWN && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable CTRL+ALT+F12
            if (pkbhs->vkCode == VK_F12 && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable CTRL+ALT+DELETE
            if (pkbhs->vkCode == VK_DELETE && bMenuKeyDown && bControlKeyDown)
                return 1;

            // Disable Left Alt+Shift+NumLock - doesn't work
            if (pkbhs->vkCode == VK_NUMLOCK && bShiftKeyDown && bMenuKeyDown)
                return 1;

            // not listed in vir keycodes
            if (pkbhs->vkCode == 0x5F)
                return 1;

            // not listed in vir keycodes
            if (pkbhs->vkCode == 0xAA)
                return 1;

            // not listed in vir keycodes
            if (pkbhs->vkCode == 0xAB)
                return 1;

            // not listed in vir keycodes
            if (pkbhs->vkCode == 0xAC)
                return 1;

            // not listed in vir keycodes
            if (pkbhs->vkCode == 0xB2)
                return 1;

            if (pkbhs->vkCode == 0xB0)
                return 1;

            if (pkbhs->vkCode == 0xB1)
                return 1;

            if (pkbhs->vkCode == 0xB3)
                return 1;

            if (pkbhs->vkCode == 0xB4)
                return 1;

            if (pkbhs->vkCode == 0xB5)
                return 1;

            if (pkbhs->vkCode == 0xB6)
                return 1;

            if (pkbhs->vkCode == 0xB7)
                return 1;

            g_WinKeyDown = (wParam == WM_KEYDOWN) && (pkbhs->vkCode == VK_LWIN || pkbhs->vkCode == VK_RWIN);

            // WIN KEYS
            if (pkbhs->vkCode == VK_LWIN || pkbhs->vkCode == VK_RWIN)
              return 1;

            break;
        }

        default:
            break;
    }

    return CallNextHookEx (g_Hook, nCode, wParam, lParam);
}

void HandleMetroUI (BOOL aDisable)
{
  if (!IsWindows8OrGreater()) return;

  if (!aDisable)
  {
    HANDLE hProcess, hSnapshot;
    PROCESSENTRY32 ProcessEntry;
    BOOL moreproc = FALSE;

    hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPALL, 0);

    if (hSnapshot == (HANDLE)-1) return;

    ProcessEntry.dwSize = sizeof(ProcessEntry);
    moreproc = Process32First(hSnapshot, &ProcessEntry);

    bool explorerFound = false;

    while (moreproc)
    {

      hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, ProcessEntry.th32ProcessID);

      if (hProcess == NULL)
      {
        moreproc = Process32Next(hSnapshot, &ProcessEntry);
        continue;
      }

      nsAutoString pname(ProcessEntry.szExeFile);


      // PrintLogWMsg(ProcessEntry.szExeFile);

      if (pname.EqualsIgnoreCase("explorer.exe"))
      {
        explorerFound = true;
      }

      CloseHandle(hProcess);
      moreproc = Process32Next(hSnapshot, &ProcessEntry);
    }

    if (!explorerFound)
    {
      // PrintLogMsg("Start Process");

      STARTUPINFOW si;
      PROCESS_INFORMATION pi;

      ZeroMemory(&si, sizeof(si));
      si.cb = sizeof(si);
      ZeroMemory(&pi, sizeof(pi));

      if (!CreateProcessW(L"C:\\Windows\\explorer.exe", nullptr, nullptr, nullptr, FALSE, DETACHED_PROCESS, nullptr, nullptr, &si, &pi))
        printf("Could not execute program\n");
    }
  }
}


void DisableWinDesktop(BOOL bDisable)
{

  /**
   * This code is here because xpcshell is run for tests
   * and we don't want SB specific features to run
   */

  // START XPCSHELL
  WCHAR exeName[MAX_PATH];
  GetModuleFileName(NULL, exeName, MAX_PATH);

  nsAutoString exe(exeName);

  // int r = exe.Find(NS_LITERAL_STRING_FROM_CSTRING("xpcshell.exe"), 0);

  if (bDisable)
    printf("DisableWinDesktop:TRUE\n");
  else
    printf("DisableWinDesktop:FALSE\n");

  if (exe.Find(NS_LITERAL_STRING_FROM_CSTRING("xpcshell.exe"), 0) >= 0) return;
  // END XPCSHELL

  // task manager (Ctrl+Alt+Del)
  HKEY hk;

  if (bDisable)
  {
    if (IsWindowsVistaOrGreater())
    {
      if (RegOpenKeyEx(HKCU, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Accessibility", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
      {
        DWORD size = sizeof(G_CONFIGURATION);

        // the the currently set value and set it globally so we can reset it when we shut down
        RegQueryValueEx(hk, L"Configuration", NULL, NULL, (LPBYTE)G_CONFIGURATION, &size);

        RegSetValueEx(hk, L"Configuration", NULL, REG_SZ, (const BYTE*)TEXT(""), sizeof(TEXT("")));
      }
    }

    STICKYKEYS skOff = g_StartupStickyKeys;

    // Disable the hotkey and the confirmation
    skOff.dwFlags &= ~SKF_HOTKEYACTIVE;
    skOff.dwFlags &= ~SKF_CONFIRMHOTKEY;

    SystemParametersInfo(SPI_SETSTICKYKEYS, sizeof(STICKYKEYS), &skOff, 0);

    TOGGLEKEYS tkOff = g_StartupToggleKeys;

    tkOff.dwFlags &= ~TKF_HOTKEYACTIVE;
    tkOff.dwFlags &= ~TKF_CONFIRMHOTKEY;

    SystemParametersInfo(SPI_SETTOGGLEKEYS, sizeof(TOGGLEKEYS), &tkOff, 0);

    FILTERKEYS fkOff = g_StartupFilterKeys;

    fkOff.dwFlags &= ~FKF_HOTKEYACTIVE;
    fkOff.dwFlags &= ~FKF_CONFIRMHOTKEY;

    SystemParametersInfo(SPI_SETFILTERKEYS, sizeof(FILTERKEYS), &fkOff, 0);

    HIGHCONTRAST hcOff = g_StartupHighContrast;

    hcOff.dwFlags &= ~HCF_HOTKEYACTIVE;
    hcOff.dwFlags &= ~HCF_CONFIRMHOTKEY;

    MOUSEKEYS mkf;

    // Fill in the members of the MOUSEKEYS structure.

    mkf.cbSize = sizeof(MOUSEKEYS);
    mkf.dwFlags = NULL;
    mkf.iMaxSpeed = 200;
    mkf.iTimeToMaxSpeed = 1000;
    mkf.iCtrlSpeed = 2;
    mkf.dwReserved1 = 0;
    mkf.dwReserved2 = 0;

    // Call SystemParametersInfo with the SPI_SETMOUSEKEYS flag.

    SystemParametersInfo(SPI_SETMOUSEKEYS, sizeof(MOUSEKEYS), (LPVOID) &mkf, 0);
  }
    else
  {
    // if (!g_TMWasSet) RegDeleteValue(hk, L"DisableTaskMgr");
    // else RegSetValueEx(hk, VAL_DisableTaskMgr, NULL, REG_DWORD, (BYTE*)&g_TMVal, sizeof(g_TMVal));

    /********
    if (!g_SessionLockWasSet && g_SessionLockKey)
    {
      DWORD val = 0;
      RegSetValueEx(hk, L"DisableLockWorkstation", NULL, REG_DWORD, (BYTE*)&val, sizeof(val));
    }
      else if (!g_SessionLockKey) RegDeleteValue(hk, L"DisableLockWorkstation");
    ********/
  }

  HWND hwnd = FindWindow(L"Shell_traywnd", NULL);
  ShowWindow(FindWindow(L"Shell_TrayWnd", NULL), SW_HIDE);
  ShowWindow(FindWindowEx(hwnd, 0, L"Button", NULL), SW_HIDE);

  if (bDisable)
  {
    ShowWindow(hwnd, SW_HIDE); // hide it
    EnableWindow(hwnd, false); // disable it
    EnableWindow(FindWindowEx(hwnd, 0, L"Button", NULL), false); // disable it

    if (IsWindowsVistaOrGreater())
    {
      HWND startOrb = FindWindowEx(NULL, NULL, MAKEINTATOM(0xC017), NULL);
      ShowWindow(startOrb, SW_HIDE); // Hide Vista Start Orb
    }
  }
    else
  {
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

  UINT nPreviousState;
  // this call only works on older win32 OS's --pete
  SystemParametersInfo (SPI_SETSCREENSAVERRUNNING, TRUE, &nPreviousState, 0);

  g_Hook = SetWindowsHookEx(WH_KEYBOARD_LL, LowLevelKeyboardProc, GetModuleHandle(NULL), 0);

  HandleMetroUI(bDisable);
}

// END:SECURE BROWSER

