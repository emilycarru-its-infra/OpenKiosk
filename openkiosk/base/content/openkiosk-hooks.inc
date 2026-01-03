#ifndef XP_MACOSX
  try
  {
    // This adds smoother window sizing on Linux and Windows
    OpenKioskUtils.sizeWindow();
#ifdef XP_LINUX
    // OpenKioskUtils.setFullscreen();
#endif
  }
    catch (e) { OpenKioskDebug.error(e); }
#endif

Services.obs.addObserver(OpenKiosk, "browser-window-before-show");
window.addEventListener("unload", OpenKiosk.unload);

