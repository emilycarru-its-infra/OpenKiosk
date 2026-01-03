nsAppShell::nsAppShell() :
    mEventWnd(nullptr),
    mNativeCallbackPending(false),
    mLastNativeEventScheduledMutex("nsAppShell::mLastNativeEventScheduledMutex")
{

  if (!XRE_IsParentProcess()) return;

  printf("-------- nsAppShell::CONSTRUCTOR --------\n");

  DisableWinDesktop(TRUE);

  // PrintLogInt(g_IsSet);

  if (!g_IsSet)
  {
    // PrintLogMsg("GETTING STATE INFO ...");

    HKEY hk;
    DWORD type;
    char buf[2048];
    DWORD size = sizeof(buf);


    SystemParametersInfo(SPI_GETSTICKYKEYS, sizeof(STICKYKEYS), &g_StartupStickyKeys, 0);

    // PrintLogInt(bStatus);

    // get sticky key flags
    if (RegOpenKeyEx(HKCU, L"Control Panel\\Accessibility\\StickyKeys", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
    {
      RegQueryValueEx(hk, L"Flags", NULL, &type, (LPBYTE)buf, &size);

      if (type == REG_SZ)
      {
        // PrintLogMsg("STICKY KEYS");
        // PrintLogMsg(buf);
        g_StartupStickyKeys.dwFlags = atoi(buf);
      }
    }

    SystemParametersInfo(SPI_GETTOGGLEKEYS, sizeof(TOGGLEKEYS), &g_StartupToggleKeys, 0);
    // PrintLogInt(bStatus);

    // get toggle key flags
    if (RegOpenKeyEx(HKCU, L"Control Panel\\Accessibility\\ToggleKeys", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
    {
      RegQueryValueEx(hk, L"Flags", NULL, &type, (LPBYTE)buf, &size);

      if (type == REG_SZ)
      {
        // PrintLogMsg("TOGGLE KEYS");
        // PrintLogMsg(buf);
        g_StartupToggleKeys.dwFlags = atoi(buf);
      }
    }

    SystemParametersInfo(SPI_GETFILTERKEYS, sizeof(FILTERKEYS), &g_StartupFilterKeys, 0);
    // PrintLogInt(bStatus);

    // get filter key flags
    if (RegOpenKeyEx(HKCU, L"Control Panel\\Accessibility\\Keyboard Response", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
    {
      RegQueryValueEx(hk, L"Flags", NULL, &type, (LPBYTE)buf, &size);

      if (type == REG_SZ)
      {
        // PrintLogMsg("FILTER KEYS");
        // PrintLogMsg(buf);
        g_StartupFilterKeys.dwFlags = atoi(buf);
      }    }

    SystemParametersInfo(SPI_GETHIGHCONTRAST, sizeof(HIGHCONTRAST), &g_StartupHighContrast, 0);
    // PrintLogInt(bStatus);

    // get filter key flags
    if (RegOpenKeyEx(HKCU, L"Control Panel\\Accessibility\\HighContrast", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
    {
      RegQueryValueEx(hk, L"Flags", NULL, &type, (LPBYTE)buf, &size);

      if (type == REG_SZ)
      {
        // PrintLogMsg("HIGH CONTRAST");
        // PrintLogMsg(buf);
        g_StartupHighContrast.dwFlags = atoi(buf);
      }
    }

    g_StartupMouseKeys.dwFlags = 0;
    g_StartupMouseKeys.iMaxSpeed = NULL;
    g_StartupMouseKeys.iTimeToMaxSpeed = NULL;
    g_StartupMouseKeys.iCtrlSpeed = NULL;
    g_StartupMouseKeys.dwReserved1 = 0;
    g_StartupMouseKeys.dwReserved2 = 0;

    SystemParametersInfo(SPI_GETMOUSEKEYS, sizeof(g_StartupMouseKeys), &g_StartupMouseKeys, 0);

    // get mouse key flags
    if (RegOpenKeyEx(HKCU, L"Control Panel\\Accessibility\\MouseKeys", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
    {
      RegQueryValueEx(hk, L"Flags", NULL, &type, (LPBYTE)buf, &size);

      if (type == REG_SZ)
      {
        // PrintLogMsg("MOUSE KEYS");
        // PrintLogMsg(buf);
        g_StartupMouseKeys.dwFlags = atoi(buf);
      }
    }

    g_IsSet = TRUE;
  }
}

void
nsAppShell::OKCleanUp()
{

  if (!XRE_IsParentProcess()) return;

  printf("-------- nsAppShell::DESTRUCTOR --------\n");

  DisableWinDesktop(false);

  SystemParametersInfo(SPI_SETSTICKYKEYS, sizeof(STICKYKEYS), &g_StartupStickyKeys, 0);
  SystemParametersInfo(SPI_SETTOGGLEKEYS, sizeof(TOGGLEKEYS), &g_StartupToggleKeys, 0);
  SystemParametersInfo(SPI_SETFILTERKEYS, sizeof(FILTERKEYS), &g_StartupFilterKeys, 0);
  SystemParametersInfo(SPI_SETMOUSEKEYS, sizeof(MOUSEKEYS), &g_StartupMouseKeys, 0);

  HKEY hk;

  if (IsWindowsVistaOrGreater())
  {
    if (RegOpenKeyEx(HKCU, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Accessibility", 0, KEY_QUERY_VALUE | KEY_SET_VALUE, &hk) == ERROR_SUCCESS)
    {
      RegSetValueEx(hk, L"Configuration", NULL, REG_SZ, (const BYTE*)G_CONFIGURATION, strlen(G_CONFIGURATION));
    }
  }
}

