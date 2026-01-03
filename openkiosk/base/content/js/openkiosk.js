var OpenKiosk =
{
                       inited : false,
               attractEnabled : false,
            attractPageLoaded : false,
               homePageLoaded : true,
            fullscreenEnabled : false,
            fullscreenEntered : false,
  browser_link_open_newwindow : false,
                        timer : null,
                urlbarshowing : null,
                   offlineInt : null,

  observe : function (subject, topic, data)
  {
    if (topic == "browser-window-before-show")
    {
      OpenKioskDebug.print("START OPENKIOSK LOAD");
      OpenKiosk.hooks();
    }
  },

  hooks : function ()
  {
    try
    {
      // OpenKioskDebug.print("HOOKS");

      OpenKioskUtils.init();

      OpenKioskUtils.lockScreen();

      OpenKiosk.setPrefs();
      OpenKiosk.addListeners();
      OpenKiosk.addObservers();
      OpenKiosk.setURLBarStatus();

      OpenKiosk._init();
      OpenKiosk.uiInit();

      // for debugging
      // OpenKiosk.openWebConsole();
      // OpenKiosk.openBrowserConsole();

      OpenKiosk.offlineInt = setInterval(OpenKiosk.checkOffline, 5000);
      // OpenKioskDebug.print("INTERVAL", this.offlineInt);
    } 
      catch (e) { OpenKioskDebug.error(e); }
  },

  init : function ()
  {
    OpenKiosk.initPrintSettings();

    OpenKioskSession.init();
    OpenKioskAdmin.init();

    OpenKiosk.delayedInit();
  },

  uiInit : function ()
  {
    if (OpenKiosk.inited) OpenKiosk.resetAttract();
    OpenKiosk.hideUI();
    OpenKiosk.handleUIControls();
    OpenKiosk.handleNavigationKeys();
  },

  setURLBarStatus : function ()
  {
    OpenKiosk.urlbarshowing = Services.prefs.getBoolPref("openkiosk.ui.urlbar.enabled");
    // OpenKioskDebug.print("URLBAR STATUS", "SHOWING", OpenKiosk.urlbarshowing);
  },

  _init : function ()
  {
    OpenKiosk.attractEnabled = Services.prefs.getBoolPref("openkiosk.attractscreen.enabled");
    OpenKiosk.fullscreenEnabled = Services.prefs.getBoolPref("openkiosk.fullscreen.enabled");

    OpenKiosk.doNotDisturb();

    OpenKiosk.attractPageLoaded = OpenKiosk.attractEnabled;
  },

  delayedInit : function ()
  {
    // white blank screen has nothing to do w/ resize
    // OpenKioskUtils.sizeWindow();

    setTimeout(OpenKiosk.handleDevControls, 200);

    OpenKioskUtils.loadFrameScript();

    // for when we launch from a terminal
    // setTimeout(OpenKioskUtils.sizeWindow, 500);

    // setTimeout(OpenKioskUtils.clearUserData, 500);

    // OpenKiosk.initTimer();
  },

  checkOffline : function ()
  {
    if (window.navigator.onLine) return;

    clearInterval(OpenKiosk.offlineInt);
    OpenKiosk.handleOffline();
  },


  handleOffline : function ()
  {
    OpenKioskDebug.print("ONLINE", "STATUS", window.navigator.onLine);

    if (window.navigator.onLine) 
    {
      OpenKioskSession.forcedReset();
      OpenKiosk.offlineInt = setInterval(OpenKiosk.checkOffline, 5000);
      return;
    }

    OpenKiosk.attractPageLoaded = false;
    setTimeout(OpenKiosk.handleOffline, 2000);
  },

  // No longer used
  handleTextEntered : function (e)
  {
    // OpenKioskDebug.print(e.target.id);

    if (e.target.id == "urlbar-input")
    {
      let urlbar = document.getElementById("urlbar-input");

      if (urlbar.value == "about:openkiosk") 
      {
        OpenKioskDebug.print("STOP PROPAGATION");
        e.preventDefault();
        e.stopImmediatePropagation();
        OpenKioskAdmin.login();
      }
    }
  },

  handleAboutOpenKiosk : function (aReq)
  {
    OpenKioskDebug.print("HANDLE ABOUT OPENKIOSK", aReq.URI.spec.trim());

    if (aReq.URI.spec.trim() == "about:openkiosk")
    {
      OpenKioskUtils.cancelRequest(aReq);
      OpenKioskUtils.loadBlankPage();
      OpenKioskAdmin.login();
      return true;
    }

    return false;
  },

  handleJavascriptCmd : function (aEl, aParam)
  {
    if (Services.prefs.getBoolPref("openkiosk.filters.protocol.javascript.enabled")) aEl.handleCommand(aParam);
    else OpenKioskUtils.loadRedirectPage();
  },

  doNotDisturb : function ()
  {
    /********
    try
    {
      let alertsService = Cc["@mozilla.org/alerts-service;1"]
                          .getService(Ci.nsIAlertsService)
                          .QueryInterface(Ci.nsIAlertsDoNotDisturb);

      // This will throw if manualDoNotDisturb isn't implemented.
      // OpenKioskDebug.print("ALERT SERVICE SET DO NOT DISTURB");
      // alertsService.manualDoNotDisturb = true;
    } 
      catch (e) { OpenKioskDebug.error(e); }
    ********/
  },

  delayedStartupFinished :
  {
    observe : function (subject, topic, data)
    {
      if (topic == "browser-delayed-startup-finished")
      {
        OpenKiosk.init();
        Services.obs.removeObserver(OpenKiosk.delayedStartupFinished, topic);
      }
    }
  },

  addObservers : function ()
  {
    Services.obs.addObserver(OpenKiosk.delayedStartupFinished, "browser-delayed-startup-finished", false);
    Services.prefs.addObserver("browser.link.open_newwindow", OpenKiosk.prefObserver, false);
    Services.prefs.addObserver("openkiosk.attractscreen.enabled", OpenKiosk.prefObserver, false);
    Services.prefs.addObserver("openkiosk.fullscreen.enabled", OpenKiosk.prefObserver, false);
    Services.prefs.addObserver("openkiosk.ui.personalbar.enabled", OpenKiosk.prefObserver, false);

    OpenKioskUtils.mOK.addObservers();
  },

  addListeners : function ()
  {
    OpenKiosk.addMessageListener();  
  
    gBrowser.tabContainer.addEventListener("TabOpen", OpenKiosk.onNewTabOpened, true);
    gBrowser.tabContainer.addEventListener("TabSelect", OpenKiosk.onTabSelect, true);

    gBrowser.addProgressListener(openkioskProgressListener);

    window.addEventListener("MozDOMFullscreen:Entered", OpenKiosk.onEnterFullScreen, true, false);
    window.addEventListener("MozDOMFullscreen:Exited", OpenKiosk.onExitFullScreen, true, false);

    window.addEventListener("keydown", OpenKiosk.onKeyDown, true, false);

    window.addEventListener("unload", OpenKiosk.unload);
    window.addEventListener("focus", OpenKiosk.handleOSKFocus, true);
  },

  addMessageListener : function () { messageManager.addMessageListener("OpenKiosk:FrameMessageListener", OpenKiosk.FrameMessageListener); },

  prefObserver :
  {
    observe : function (subject, topic, data)
    {
      if (topic == "nsPref:changed")
      {
        if (data == "browser.link.open_newwindow") 
        {
          OpenKiosk.browser_link_open_newwindow = (Services.prefs.getIntPref("browser.link.open_newwindow") == 1);
          // OpenKioskDebug.print("browser_link_open_newwindow", OpenKiosk.browser_link_open_newwindow);
          OpenKiosk.handleUIControls();
        }

        if (data == "openkiosk.attractscreen.enabled") 
        {
          OpenKiosk.attractEnabled = Services.prefs.getBoolPref("openkiosk.attractscreen.enabled");
       }

        if (data == "openkiosk.fullscreen.enabled") OpenKiosk.fullscreenEnabled = Services.prefs.getBoolPref("openkiosk.fullscreen.enabled");

        if (data == "openkiosk.ui.personalbar.enabled") OpenKiosk._handlePersonalBar();

        if (data == "openkiosk.tabs.enabled") OpenKiosk.handlePersonalBarMenu();
      }
    }
  },

#ifdef XP_MACOSX
#include osxkeys.inc
#endif

#ifdef XP_WIN
#include winkeys.inc
#endif

#ifdef XP_LINUX
#include linuxkeys.inc
#endif

  unload : function ()
  {
    OpenKioskDebug.print("UNLOAD");
    OpenKioskUtils.clearUserData();
    OpenKiosk.clearTimer();
    OpenKioskUtils.clearBookmarks();
    OpenKioskDebug.print("REMOVING ALL LISTENERS");
    OpenKioskUtils.removeListeners()
    OpenKioskSession.removeListeners()
    OpenKioskAdmin.removeListeners()
    OpenKioskAdmin.setAdminPrefs();
#ifdef XP_LINUX
    OpenKioskUtils.mOK.setOpenKioskUIMode(true);
#endif
    OpenKioskUtils.mOK = null;
    OpenKioskDebug.print("CLEAR OFFLINE", OpenKiosk.offlineInt);
    clearInterval(OpenKiosk.offlineInt);
  },

  onNewTabOpened : function ()
  {
    // OpenKioskDebug.print("NEW TAB OPENED");
    if (OpenKiosk.attractEnabled || Services.prefs.getBoolPref("openkiosk.tabs.enabled"))
    {
      OpenKiosk.resetAttract();
      OpenKiosk.handleMainToolbar();
    }
    OpenKioskAdmin.showNotification();

    if (OpenKiosk.fullscreenEnabled) setTimeout(OpenKioskUtils.loadNewTabPage, 500);
  },

  onTabSelect : function ()
  {
    // OpenKioskDebug.print("TAB SELECTED", "OPENKIOSK JSENABLED", OpenKioskUtils.jsEnabled);

    // if filters are off then set global js to OpenKiosk js setting
    if (!OpenKioskSession.filtersEnabled)
    {
      OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
      return;
    }

    if (!OpenKioskUtils.jsEnabled) return;
    
    // OpenKioskDebug.print("TAB SELECTED", "URI", gBrowser.currentURI.spec, "JSENABLED", typeof(gBrowser.selectedBrowser.jsEnabled));

    // value is undefined when we reset new tab to homepage
    if (gBrowser.selectedBrowser.jsEnabled == undefined) return;

    OpenKioskUtils.enableJavascript(gBrowser.selectedBrowser.jsEnabled);
  },

  onEnterFullScreen : function ()
  {
    OpenKioskDebug.print("ENTER FULL SCREEN");
    OpenKiosk.fullscreenEntered = true;
    
#ifndef XP_MACOSX
    if (!OpenKioskAdmin.adminMode) 
    {
      // OpenKioskUtils._setFullscreen();
      // OpenKioskUtils.hideMenubar(true);
    }
#else
      OpenKioskUtils.lockScreen();
#endif
  },

  onExitFullScreen : function ()
  {
    OpenKioskDebug.print("EXIT FULL SCREEN");
    OpenKiosk.fullscreenEntered = false;

#ifndef XP_MACOSX
    if (!OpenKioskAdmin.adminMode) 
    {
      // OpenKioskUtils._setFullscreen();
      // OpenKioskUtils.hideMenubar(true);
    }
#else
      OpenKioskUtils.relockScreen();
#endif
  },

  invalidateHomePage : function () 
  { 
    // OpenKioskDebug.print("INVALIDATE HOME PAGE");
    OpenKiosk.homePageLoaded = false; 
  },

  invalidateHomeAndAttractPage : function () 
  { 
    OpenKiosk.invalidateHomePage();
    OpenKiosk.resetAttract();
  },

  handleUIControls : function ()
  {
    // OpenKioskDebug.print("HANDLE UI CONTROLS");

    if (OpenKioskAdmin.adminMode) return;

    // 1 means all windows diverted to single tab
    let c = (OpenKiosk.browser_link_open_newwindow);
        
    // set collapsed state of our broadcaster
    let el = document.getElementById("OpenKiosk:Tabs");
    el.collapsed = c;

    el = document.getElementById("cmd_newNavigatorTab");

    // if we are a single tab then remove new tab command
    if (c) el.removeAttribute("command");
    else el.setAttribute("command", "cmd_newNavigatorTab");

    OpenKiosk.hideTabsToolbar();
  },

  handleNavigationKeys : function ()
  {
    let enabled = Services.prefs.getBoolPref("openkiosk.keys.navigation.enabled");

    // OpenKioskDebug.print("HANDLE NAVIGATION KEYS", "ENABLED", enabled); 

    // okHandleBackspace, okHandleShiftBackspace, goBackKb, goForwardKb, goBackKb, goForwardKb, goBackKb2, goForwardKb2

    let a = ["okHandleBackspace", "okHandleShiftBackspace", "goBackKb", "goForwardKb", "goBackKb", "goForwardKb", "goBackKb2", "goForwardKb2"];

    for (let i=0; i<a.length; ++i)
    {
      let e = document.getElementById(a[i]);

      if (e)
      {
        let c = e.getAttribute("command");

        // comment out command attribute if keys not enabled
        if (!enabled) c = c.replace(/^/, "\/\/ ");
        else c = c.replace(/^\/\/ /, "");

        e.setAttribute("command", c);

        // OpenKioskDebug.print("KEY", e.id, "command", c);
      }
    }
  },

  removeDevKeys : function ()
  {
    let keys = ["toggleToolbox", "toggleToolboxF12", "toggleToolbar", "webide", "browserToolbox", "browserConsole", "responsiveDesignMode", 
                "scratchpad", "inspector", "webconsole", "jsdebugger", "netmonitor", "styleeditor", "performance", "storage", "dom"];

    for (let i=0; i<keys.length; ++i)
    {
      let el = document.getElementById("key_"+keys[i]);
      // OpenKioskDebug.print("REMOVING", el.id);
      if (el) el.parentNode.removeChild(el);
    }
  },

  handleDevControls : function ()
  {
    // OpenKioskDebug.print("handleDevControls");

    OpenKiosk.removeDevKeys();
  },

  openWebConsole : async function ()
  {
    try
    {
      OpenKioskDebug.print("OPEN WEB CONSOLE");

      const {require} = ChromeUtils.import("resource://devtools/shared/loader/Loader.jsm");
      const {gDevToolsBrowser} = require("devtools/client/framework/devtools-browser");

      await gDevToolsBrowser.toggleToolboxCommand(gBrowser);
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  openBrowserConsole : function() 
  {
    const {require} = ChromeUtils.import("resource://devtools/shared/loader/Loader.jsm");
    const { BrowserConsoleManager, } = require("devtools/client/webconsole/browser-console-manager");
    BrowserConsoleManager.openBrowserConsoleOrFocus();
  },

  // hide the tabs toolbar
  hideTabsToolbar : function ()
  {
    // OpenKioskDebug.print("hideTabsToolbar");

    OpenKiosk._hideTabsToolbar();
  },

  // this has to be a delayed call 
  _hideTabsToolbar : function ()
  {
    // OpenKioskDebug.print("_hideTabsToolbar");

    // show or hide tabs toolbar
    let c = (OpenKiosk.browser_link_open_newwindow);

    // in admin mode always show tabs
    if (OpenKioskAdmin.adminMode) 
    {
      OpenKioskAdmin.showControl("titlebar");
      OpenKioskAdmin.showControl("TabsToolbar");
    } else document.getElementById("TabsToolbar").collapsed = c;

    // OpenKioskDebug.print("_hideTabsToolbar", "fullscreenEnabled", OpenKiosk.fullscreenEnabled);
    // OpenKioskDebug.print("_hideTabsToolbar", "open_newwindow", OpenKiosk.browser_link_open_newwindow);

    // if we are in fullscreen and have tabs enabled then allow context menu item
    if (OpenKiosk.fullscreenEnabled) c = !OpenKioskAdmin.adminMode && !Services.prefs.getBoolPref("openkiosk.tabs.enabled");

    // hide or show "Open Link in New Tab" context menuitem
    document.getElementById("context-openlinkintab").collapsed = c;
  },

  loadAttractURI : function ()
  {
    if (OpenKiosk.attractEnabled && !OpenKiosk.attractPageLoaded)
    {
      OpenKioskDebug.print("LOAD ATTRACT SCREEN", OpenKioskUtils.attractURI.spec);

      // OpenKiosk.handleMainToolbar();

      OpenKioskUtils.loadURI(OpenKioskUtils.attractURI);
    }
  },

  resetAttract : function () { OpenKiosk.attractPageLoaded = false; },

  setAttractPageLoaded : function (aLoc) 
  { 
    if (OpenKiosk.attractEnabled && !OpenKiosk.attractPageLoaded && aLoc.equals(OpenKioskUtils.attractURI)) 
    {
      OpenKioskDebug.print("SET ATTRACT LOADED", true);
      OpenKiosk.attractPageLoaded = true;
    }
     else if (OpenKiosk.inited) OpenKiosk.resetAttract();

  },

  handleMainToolbar : function ()
  {
    // OpenKioskDebug.print("HANDLE MAIN TOOLBAR");

    if (OpenKioskAdmin.adminMode && !OpenKioskAdmin.exiting) return;

    OpenKiosk.handlePersonalBar();

    let ntb = document.getElementById("navigator-toolbox");
    let nb = document.getElementById("nav-bar");
    let tabsEnabled = Services.prefs.getBoolPref("openkiosk.tabs.enabled");

    // OpenKioskDebug.print("TABS ENABLED" , tabsEnabled);

    if (OpenKiosk.fullscreenEnabled && OpenKiosk.attractEnabled)
    {
      OpenKioskDebug.print("FULLSCREEN AND ATTRACT");
      // OpenKioskDebug.print("ATTRACT PAGE LOADED" , OpenKiosk.attractPageLoaded)

      nb.collapsed = true;
      ntb.collapsed = (!tabsEnabled || OpenKiosk.attractPageLoaded);
    }
      else if (OpenKiosk.fullscreenEnabled)
    {
      OpenKioskDebug.print("FULLSCREEN HIDE MAIN TOOLBAR")
      nb.collapsed = true;
      ntb.collapsed = !tabsEnabled;
    }
      else if (OpenKiosk.attractEnabled)
    {
      OpenKioskDebug.print("ATTRACT ONLY");
      nb.collapsed = false;
      
      if (!OpenKiosk.inited)
      {
        function load () { ntb.collapsed = OpenKiosk.attractPageLoaded; }
        setTimeout(load, 1000);
      } 
        else
      {
        ntb.collapsed = OpenKiosk.attractPageLoaded;
      }
    }
      else
    {
      // OpenKioskDebug.print("DEFAULT SHOW MAIN TOOLBAR");
      nb.collapsed = ntb.collapsed = false;

      if (tabsEnabled)
      {
        OpenKioskAdmin.showControl("titlebar");
        OpenKioskAdmin.showControl("TabsToolbar");
      }
    }

    // if (!aHide) Services.prefs.setIntPref("browser.link.open_newwindow", 0);
    // else Services.prefs.clearUserPref("browser.link.open_newwindow");
  },

  hideUIControl : function (aID, aHide)
  {
    let e = document.getElementById(aID);
    if (e) e.hidden = e.collapsed = aHide;
  },

  hideUI : function (aIsAdmin)
  {
    try
    {
      let allow = (aIsAdmin == true);

      OpenKioskDebug.print("HIDE UI");

      /** 
       * Main Toolbox & Titlebar 
       */

      if (!aIsAdmin && !Services.prefs.getBoolPref("openkiosk.tabs.enabled")) 
      {
        OpenKioskDebug.print("HIDE TABS TOOLBAR & TITLEBAR");
        this.hideUIControl("titlebar", true);
        this.hideUIControl("TabsToolbar", true);
      }

      if (!aIsAdmin && !Services.prefs.getBoolPref("openkiosk.ui.statusbar.enabled")) 
        this.hideUIControl("statuspanel", true);
      else
        this.hideUIControl("statuspanel", false);

      OpenKiosk.handleMainToolbar();

      /** 
       * Toolbar Buttons
       */

      // Set fullscreentoolbar atribute to true so we can see the personalbar
      document.getElementById("PersonalToolbar").setAttribute("fullscreentoolbar", true);
      document.getElementById("toolbar-menubar").setAttribute("fullscreentoolbar", true);

      // Panel UI Button
      this.hideUIControl("PanelUI-button", !allow);

      // this.hideUIControl("firefox-view-button", true);
      this.hideUIControl("unified-extensions-button", true);
      this.hideUIControl("tracking-protection-icon-container", true);

      // not sure if we should hide this (it is not set to removable)
      this.hideUIControl("alltabs-button", true);

      // restore button
      this.hideUIControl("restore-button", true);

      // import bookmarks button
      this.hideUIControl("import-button", true);

      // urlbar bookmark star button
      this.hideUIControl("star-button-box", true);

      // personal toolbar empty message box
      this.hideUIControl("personal-toolbar-empty", true);

      /** 
       * Main Menubar
       */

      if (!allow) OpenKioskUtils.showMainMenubar(false);

      /** 
       * Toolbar Context Menu
       */

      // Menu Separator
      this.hideUIControl("viewToolbarsMenuSeparator", true);

      // "Customize..."
      let el = document.getElementById("viewToolbarsMenuSeparator");
      el.nextSibling.hidden = el.nextSibling.collapsed = true;

      // Urlbar Context
      function urlbarContext (aHide)
      {
        let urlbar = document.getElementById("urlbar");
        let textBox = urlbar.querySelector("moz-input-box");
        textBox.menupopup.collapsed = textBox.menupopup.hidden = aHide;
      }
      urlbarContext(!Services.prefs.getBoolPref("openkiosk.ui.urlbar.context.enabled"));

      /** 
       * Tab Context Menu
       */

      this.handleTabsContextItems();

      OpenKiosk.handlePersonalBarMenu();

      let c = OpenKiosk.browser_link_open_newwindow;

      // set collapsed state of our UI broadcaster 
      document.getElementById("OpenKiosk:Tabs").collapsed = c;

      /** 
       * Context Menu Search
       */

      this.hideUIControl("context-searchselect", !Services.prefs.getBoolPref("openkiosk.ui.context.search.enabled"));

      /** 
       * Context Menu Full Screen
       */

      this.hideUIControl("autohide-context", true);

      /** 
       * Context Menu 
       */

      this.handleContextMenu();

      /** 
       * Personalbar Context Menu
       */
      this.handlePersonalbarContextMenu();

      /** 
       * Toolbar Context Menu
       */
      this.handleToolbarContextMenu();

      /** 
       * URLBar
       */
      if (!aIsAdmin && !OpenKiosk.fullscreenEnabled)
      {
        let show = allow || Services.prefs.getBoolPref("openkiosk.ui.urlbar.enabled");  
        OpenKioskUtils.hideURLBar(!show);
      }

      // Lock or Unlock the UI
      OpenKioskUtils.setOpenKioskUIMode(aIsAdmin);
    }
      catch (e) { OpenKioskDebug.error("hideUI", e); }
  },

  hideTabsSpacer : function ()
  {
    // OpenKioskDebug.print("HIDE TABS SPACER");

    let tb = document.getElementById("TabsToolbar");

    tb.firstChild.hidden = tb.firstChild.collapsed = true;
  },

  handleTabsContextItems : function ()
  {
    this.hideUIControl("context_openTabInWindow", true);
    this.hideUIControl("context_pinTab", true);
    this.hideUIControl("context_bookmarkSelectedTabs", true);
    this.hideUIControl("context_bookmarkTab", true);
    this.hideUIControl("context_moveTabOptions", true);
    this.hideUIControl("context_sendTabToDevice", true);
    this.hideUIControl("context_selectAllTabs", true);
    this.hideTabsSpacer();
  },

  handlePersonalbarContextMenu : function ()
  {
      let ids = [
                 "placesContext_open:newwindow", "placesContext_open:newprivatewindow",
                 "placesContext_show:info", "placesContext_show_folder:info", 
                 "placesContext_show_bookmark:info", "placesContext_showAllBookmarks",
                 "placesContext_new:bookmark"
                ];

      // Set Bookmarks Context
      this.hideUIControl("placesContext", !OpenKioskAdmin.adminMode && !Services.prefs.getBoolPref("openkiosk.ui.personalbar.bookmarks.context.enable"));

      ids.forEach(id => this.hideUIControl(id, true));
  },

  handleToolbarContextMenu : function ()
  {
    let tb = document.getElementById("TabsToolbar");

    // remove context menu
    tb.removeAttribute("context");

    // Hide Toolbar Context Menu Pin menuitem
    let pin = document.querySelectorAll('menuitem[data-lazy-l10n-id="toolbar-context-menu-pin-to-overflow-menu"]');
    pin.forEach((node) => 
    { 
      if (node.parentNode.id == "toolbar-context-menu") node.parentNode.collapsed = node.parentNode.hidden = true;
    });
  },

  handleContextMenu : function ()
  {
      this.hideUIControl("contentAreaContextMenu", !Services.prefs.getBoolPref("openkiosk.ui.context.menu.enabled"));

      let ids = [
                 "context-bookmarkpage", "context-savepage", "context-take-screenshot", "context-sep-screenshots",
                 "context-viewsource", "context-inspect", "context-savelink", "context-savelinktopocket", "context-saveimage", 
                 "context-video-saveimage", "context-savevideo", "context-saveaudio", "context-openframe", "frame", 
                 "context-openlink", "context-bookmarklink", "context-copyemail", "context-setDesktopBackground", 
                 "context-sendimage", "context-sendaudio", "context-openlinkprivate", "context-sendvideo", 
                 "context-sep-selectall", "inspect-separator", "context-sep-ctp", "context-viewpartialsource-selection",
                 "context-sep-sendlinktodevice", "spell-separator", "frame-sep", "context-sep-copylink", "context-sep-setbackground"
                ];

      ids.forEach(id => this.hideUIControl(id, true));
  },

  handleHomePage : function (aURI)
  {
    // if the home page is already invalidated then 
    // no need to compare and invalidate again
    if (!OpenKiosk.homePageLoaded) return;

    let hp = OpenKioskUtils.homePageURI;

    // HANDLE MULTIPLE HOME PAGE URL's
    if (/\|/.test(hp.spec)) 
    {
      OpenKioskDebug.print("MULTIPLE HOME PAGES PRESENT");

      if (!OpenKioskUtils.equalsMultipleURIs(hp)) OpenKiosk.invalidateHomePage();

      return;
    }

    // OpenKioskDebug.print("HANDLE HOME PAGE", aURI.spec, hp.spec);

    if (OpenKioskUtils.equalsDomainURI(aURI, hp) && OpenKiosk.homePageLoaded) return;

    // OpenKioskDebug.print("CALL", "INVALIDATE HOME PAGE");

    OpenKiosk.invalidateHomePage();
  }, 

  handlePersonalBar : function ()
  {
    // OpenKioskDebug.print("HANDLE PERSONALBAR", "HIDE", !Services.prefs.getBoolPref("openkiosk.ui.personalbar.enabled"), "ADMIN MODE", OpenKioskAdmin.adminMode, "ADMIN EXITING", OpenKioskAdmin.exiting);

    // if (OpenKioskAdmin.adminMode && !OpenKioskAdmin.exiting) return;

    OpenKiosk._handlePersonalBar();
  },

  _handlePersonalBar : function ()
  {
    let enabled = (Services.prefs.getBoolPref("openkiosk.ui.personalbar.enabled") && !OpenKiosk.fullscreenEnabled);
    let personalbar = document.getElementById("PersonalToolbar");

    if (OpenKioskAdmin.adminMode) enabled = true;

    CustomizableUI.setToolbarVisibility("PersonalToolbar", enabled);

    // OpenKioskDebug.print("_HANDLE PERSONALBAR", "ENABLED", enabled, personalbar.id);
  },

  handlePersonalBarMenu : function ()
  {
    // OpenKioskDebug.print("HANDLE PERSONALBAR MENU");

    let m = document.getElementById("placesContext_open:newtab");
    let hide = !Services.prefs.getBoolPref('openkiosk.tabs.enabled');

    m.hidden = m.collapsed = hide;
  },

  setPrefs : function ()
  {
    // 0 blank 1 home page 2 last visited 3 previous session
    Services.prefs.setIntPref("browser.startup.page", 1);

    if (OpenKiosk.fullscreenEnabled && Services.prefs.getBoolPref("openkiosk.tabs.enabled")) 
      Services.prefs.setIntPref("browser.link.open_newwindow", 1);

    // OpenKioskDebug.print("HIDE TABS", (Services.prefs.getIntPref("browser.link.open_newwindow") == 1));

    // 1 means all windows diverted to single tab
    OpenKiosk.browser_link_open_newwindow = (Services.prefs.getIntPref("browser.link.open_newwindow") == 1);
  },

  printPreview : function ()
  {
    if (Services.prefs.getBoolPref("openkiosk.print.silent.enabled")) OpenKiosk._print();
    else PrintUtils.printPreview(PrintPreviewListener);

  },

  initPrintSettings : async function ()
  {
    try
    {
      // OpenKioskDebug.print("INIT PRINT SETTINGS");
      let pSS = Cc["@mozilla.org/gfx/printsettings-service;1"].getService(Ci.nsIPrintSettingsService);
      let printSettings = pSS.defaultPrintSettingsForPrinting;

      // OpenKioskDebug.print("DEFAULT PRINT SETTINGS", printSettings);

      if (printSettings) return;

      printSettings = pSS.newPrintSettings;

      // OpenKioskDebug.print("NEW PRINT SETTINGS", printSettings);

      let pl = Cc["@mozilla.org/gfx/printerlist;1"].getService(Ci.nsIPrinterList);
      let pn = await pl.systemDefaultPrinterName;

      // OpenKioskDebug.print("NAME", pn);

      pSS.initPrintSettingsFromPrinter(pn, printSettings);
      pSS.initPrintSettingsFromPrefs(printSettings, true, Ci.nsIPrintSettings.kInitSaveAll);

      // OpenKioskDebug.print("PRINT SETTINGS PRINTER NAME", printSettings.printerName);

      if (!printSettings.printerName) printSettings.printerName = pn;

#ifdef XP_WIN
      // OpenKioskDebug.print("SAVE PRINT SETTINGS TO PREFS");
      pSS.savePrintSettingsToPrefs(printSettings, false, Ci.nsIPrintSettings.kInitSaveAll);
#endif
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  /********
  print : function ()
  {
    OpenKioskDebug.print("PRINT", "NAME", PrintUtils.getDefaultPrinterName());

    if (!Services.prefs.getBoolPref("openkiosk.print.silent.enabled"))
    {
      PrintUtils.printWindow(window.gBrowser.selectedBrowser.outerWindowID, window.gBrowser.selectedBrowser);
      return;
    }

    OpenKiosk._print();
  },

  _print : function ()
  {
    OpenKioskDebug.print("PRINT" "_print");

    let o = 
    {
      printerName : PrintUtils.getDefaultPrinterName(),
         windowID : window.gBrowser.selectedBrowser.outerWindowID
    };
    
    window.gBrowser.selectedBrowser.messageManager.sendAsyncMessage("OpenKiosk:PrintListener", o);
  },
  ********/

  FrameMessageListener : function (aMsg)
  {
    let command = aMsg.data.command;

    // OpenKioskDebug.print(aMsg.name, "COMMAND", command);

    switch (command)
    {
      case "openkiosk-dom-quit":
        OpenKioskAdmin.quitFromDOM();
        break;

      case "openkiosk-dom-settings":
        OpenKioskAdmin.login();
        break;

      case "openkiosk-go-home":
        OpenKioskUtils.loadHomePage();
        break;

      case "openkiosk-save-pdf":
        let b = gBrowser.selectedBrowser;
        if (b.contentPrincipal.spec == "resource://pdf.js/web/viewer.html")
        {
          OpenKioskDebug.print("SAVE PDF", "SOURCE", b.contentPrincipal.spec);
          // no longer needed
          // saveBrowser(gBrowser.selectedBrowser, true);
        }
        break;

      case "openkiosk-show-osk":
        OpenKiosk.showOSK();
        break;

      case "openkiosk-hide-osk":
        OpenKiosk.hideOSK();
        break;

      case "openkiosk-osk-iframe":
        let key = aMsg.data.key;
        OpenKioskDebug.print("KEY", key);
        const keyevent = new KeyboardEvent("keydown", { key:key });
        OpenKioskDebug.print("CONTENT DISPATCH EVENT");
        let fe = Services.focus.getFocusedElementForWindow(window, true, {});
        OpenKioskDebug.print("WINDOW FE", fe.contentDocument);
        fe.dispatchEvent(keyevent);

        OpenKioskDebug.print("WINDOW activeBrowsingContext", Services.focus.activeBrowsingContext.originAttributes);
        OpenKioskDebug.print("WINDOW focusedElement", Services.focus.focusedElement);
        // OpenKioskDebug.displayProperties(Services.focus.activeBrowsingContext.originAttributes);
        OpenKioskDebug.print("CONTENT WINDOW", Services.focus.focusedElement.contentWindow);
        break;

      case "openkiosk-contentframe-observers-added":
        Services.prefs.setBoolPref("openkiosk.contentframe.observers.added", true);
        break;

      case "openkiosk-invalidate-selection":
        OpenKiosk.invalidateHomeAndAttractPage();
        OpenKioskSession._startCountdown();
        break;
    }
  },

  capsLockOn : false, 

  OSKToggleCapsLock : function ()
  {
    OpenKiosk.capsLockOn = !OpenKiosk.capsLockOn;

    let capsKey = document.getElementById("osk-caps");

    OpenKioskDebug.print("TOGGLE CAPS LOCK", OpenKiosk.capsLockOn?"ON":"OFF", capsKey.nodeName);

    let keys = document.getElementsByClassName("keyboard_key");

    for (const key of keys) 
    {
      // OpenKioskDebug.print("CHILD", key.firstChild.nodeName);
      if (key.firstChild.nodeName.toLowerCase() == "#text") 
        key.textContent = OpenKiosk.capsLockOn ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
    }

    capsKey.classList.toggle("keyboard_key-active", OpenKiosk.capsLockOn);
  },

  handleKey : function (aControl, key)
  {
    try
    {
      let editor = aControl.editor;

      switch (key)
      {
        case "clear":
          editor.deleteSelection(editor.eNext, editor.eStrip);
          break;

        case "backspace":
          editor.deleteSelection(editor.ePrevious, editor.eStrip);
          break;

        case "keyboard_return":
          OpenKiosk.handleOSKChrome(aControl, key);
          // editor.insertLineBreak();
          break;

        case "space_bar":
          editor.insertText(" ");
          break;

        default:
          editor.insertText(key);
      }
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  handleOSKFocus : function (aEvent)
  {
    if (!Services.prefs.getBoolPref("openkiosk.osk.enabled")) return;

    let el = Services.focus.getFocusedElementForWindow(window, true, {});
    if (!el) return;

    // OpenKioskDebug.print("HANDLE FOCUS", el, el.nodeName, el.id, el.innerText);
    
    if (aEvent.target.type == "text") OpenKiosk.showOSK();
  },

  handleOSK : function (aEvent)
  {
    try
    {
      let keyEl = aEvent.target;
      let url = aEvent.target.ownerDocument.documentURI;
      let tag = keyEl.nodeName.toLowerCase();
      let keyVal = keyEl.innerText;

      let fel = document.commandDispatcher.focusedElement;

      // OpenKioskDebug.print("HANDLE OSK", "KEY", keyVal, "FOCUSED EL", fel.nodeName);
      //OpenKioskDebug.print("KEY LENGTH", keyVal.length);

      if (keyVal.length == 146) return;

      
      // Handle chrome input
      if (fel?.nodeName == "input")
      {
        OpenKioskDebug.print("FOCUSED EL", "CALL", fel);
        OpenKiosk.handleOSKChromeInput(fel, keyVal);
        return;
      }

      OpenKioskDebug.print("HANDLE OSK", tag, url);

      let control = OpenKioskAdmin.getOpenControl();

      // OpenKioskDebug.print("OPEN CONTROL", control, keyVal);

      if (!OpenKioskAdmin.adminMode && control) 
      {
        OpenKiosk.handleKey(control, keyVal);
        return;
      }

      if (tag != "html:div" && tag != "html:i") return;

      aEvent.preventDefault();

      switch (keyVal.toLowerCase())
      {
        case "keyboard_hide":
          OpenKioskDebug.print(keyVal);
          OpenKiosk.hideOSK();
          fel?.focus();
          return;
          break;

        case "keyboard_alt":
          OpenKioskDebug.print(keyVal);
          OpenKiosk.altOSKKeys();
          fel?.focus();
          return;
          break;

        case "keyboard":
          OpenKioskDebug.print(keyVal);
          OpenKiosk.resetOSKKeys();
          fel?.focus();
          return;
          break;

        case "keyboard_capslock":
          OpenKiosk.OSKToggleCapsLock();
          fel?.focus();
          return;
          break;

        case "keyboard_return":
          OpenKioskDebug.print("HANDLE RETURN");
          OpenKiosk.handleOSKReturn();
          return;
          break;

        default:
          OpenKioskDebug.print("SEND MESSAGE", "INSERT TEXT", keyVal);
          if (fel?.id == "urlbar-input") 
          {
            OpenKiosk.handleOSKChrome(fel, keyVal);
            return;
          }
            else gBrowser.selectedBrowser.messageManager.sendAsyncMessage("OpenKiosk:InsertOSKKey", { key: keyVal });
          break;
      }
      // OpenKioskDebug.print("FOCUS");
      gBrowser.selectedBrowser.focus();
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  handleOSKReturn : function ()
  {
    let el = document.commandDispatcher.focusedElement;

    OpenKioskDebug.print("handleOSKReturn");

    let url = el.ownerDocument.documentURI;
    OpenKioskDebug.print("FOCUSED ELEMENT", el, el.id, el.nodeName, url);

    if (el.nodeName == "browser")
    {
      gBrowser.selectedBrowser.messageManager.sendAsyncMessage("OpenKiosk:InsertOSKKey", { key: "keyboard_return" });
      return 
    }

    switch (el.id)
    {
      case "openkiosk-password":
        OpenKioskAdmin.loginWithPassword();
        break

      case "openkiosk-quit-password":
        OpenKioskAdmin.quitWithPassword();
        break

      case "urlbar-input":
        let keyevent = new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: KeyboardEvent.DOM_VK_RETURN });
        gURLBar.handleCommand(keyevent);
        break

      default:
        gBrowser.selectedBrowser.messageManager.sendAsyncMessage("OpenKiosk:InsertOSKKey", { key: "keyboard_return" });
    }
  },

  handleOSKChromeInput : function (focusedElement, key)
  {
    OpenKioskDebug.print("handleOSKChromeInput", "KEY", key, focusedElement.id);

    let editor = focusedElement.editor;

    if (!editor) return;

    switch (key)
    {
      case "clear":
        editor.deleteSelection(editor.eNext, editor.eStrip);
        break;
   
      case "backspace":
        editor.deleteSelection(editor.ePrevious, editor.eStrip);
        break;
   
      case "keyboard_return":
        if (focusedElement.nodeName.toLowerCase() == "textarea") editor.insertLineBreak();
        else 
        {
          OpenKiosk.handleOSKReturn();
          return;
        }
        break;
   
      case "space_bar":
        editor.insertText(" ");
        break;

      default:
        editor.insertText(key);
    }

    OpenKioskDebug.print("FOCUS", focusedElement.id);

    if (focusedElement.id == "urlbar-input") gURLBar.focus();
    else focusedElement.focus();
  },

  handleOSKChrome : function (focusedElement, key)
  {
    OpenKioskDebug.print("handleOSKChrome", "KEY", key, focusedElement.value);

    let editor = focusedElement.editor;

    if (!editor) return;

    focusedElement.focus();

    switch (key)
    {
      case "clear":
        editor.deleteSelection(editor.eNext, editor.eStrip);
        break;

      case "backspace":
        editor.deleteSelection(editor.ePrevious, editor.eStrip);
        break;

      case "keyboard_return":
        OpenKiosk.handleOSKReturn();
        break;

      case "space_bar":
        editor.insertText(" ");
        break;

      default:
        editor.insertText(key);
    }
  },

  showOSK : function ()
  {
    if (!Services.prefs.getBoolPref("openkiosk.osk.enabled")) return;

    // OpenKioskDebug.print("SHOW OSK");

    let d = document.getElementById("ok-osk");
    d.classList.remove("keyboard-hidden");
    d.addEventListener("mouseup", OpenKiosk.handleOSK, true);
  },

  hideOSK : function ()
  {
    // OpenKioskDebug.print("HIDE OSK");

    let d = document.getElementById("ok-osk");
    d.classList.add("keyboard-hidden");
    d.removeEventListener("mouseup", OpenKiosk.handleOSK, true);
  },

  altOSKKeys : function ()
  {
    OpenKioskDebug.print("ALT OSK");
    let d = document.getElementById("osk-main-keys");
    d.classList.add("keyboard-hidden");
    d = document.getElementById("osk-alt-keys");
    d.classList.remove("keyboard-hidden");
  },

  resetOSKKeys : function ()
  {
    OpenKioskDebug.print("RESET OSK");
    let d = document.getElementById("osk-main-keys");
    d.classList.remove("keyboard-hidden");
    d = document.getElementById("osk-alt-keys");
    d.classList.add("keyboard-hidden");
  },

  initTimer : function ()
  {
    OpenKiosk.timer = setInterval(OpenKioskUtils.sizeWindowIf, 500);
  },

  clearTimer : function ()
  {
    if (OpenKiosk.timer) clearInterval(OpenKiosk.timer);
  }
};

var OpenKioskAdmin = 
{
  adminMode : false,
     pass : null,
     bundle : null,
    exiting : false,
    prefURL : "about:preferences#openKiosk",

  init : function ()
  {
    this.bundle = Services.strings.createBundle("chrome://openkiosk/locale/admin.properties");

    let sp = Services.prefs.getCharPref("openkiosk.admin.password");
    sp == "admin" ? this.pass = sp : OpenKioskUtils.decryptGlobal(sp);
  },

  login : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    OpenKioskAdmin.prompt();
  },

  showAdminControls : function ()
  {
    OpenKioskDebug.print("SHOW ADMIN CONTROLS");
    OpenKioskAdmin.showControl("navigator-toolbox");
    OpenKioskAdmin.showControl("titlebar");
    OpenKioskUtils.hideMenubar(false);
    OpenKioskAdmin.showControl("TabsToolbar");
    OpenKioskAdmin.showControl("nav-bar");
    OpenKioskUtils.hideURLBar(false);
  },

  _login : function ()
  {
    OpenKioskSession.cancel();
    OpenKioskUtils.unsetFullscreen();
    OpenKioskAdmin.showAdminControls();
    OpenKioskAdmin.setUI();
    OpenKioskAdmin.resize();
  },

  resize : function (aEnter)
  {
    setTimeout(OpenKioskUtils.resizeWindow, 500);
  },

  setAdminPrefs : function (aAdmin)
  {
    let isAdmin = (aAdmin == true);

    Services.prefs.setBoolPref("xpinstall.enabled", isAdmin);
    Services.prefs.setBoolPref("openkiosk.admin.mode", isAdmin);

    this.adminMode = isAdmin;
  },

  hideControls : function (aByEsc, aID) 
  {
    // OpenKioskDebug.print("HIDE CONTROLS");

    let ids = ["openkiosk-login", "openkiosk-quit", "openkiosk-aup"];

    if (!OpenKioskAdmin.adminMode && !aByEsc) ids.push("openkiosk-admin");

    // if (!aByEsc) this.hideControl("openkiosk-error");

    if (!aID) this.hideControl("openkiosk-warning");

    ids.forEach(id => this.hideControl(id));

    this.clearInvalid("openkiosk-login");
    this.clearInvalid("openkiosk-quit");

    this.clearValue("openkiosk-password");
    this.clearValue("openkiosk-quit-password");

    OpenKioskSession.continue();
  },

  hideControl : function (aID) 
  {
    // OpenKioskDebug.print("HIDE CONTROL", aID);
    let e = document.getElementById(aID);
    if (e) e.collapsed = true;
  },

  clearValue : function (aID) 
  {
    document.getElementById(aID).value = "";
  },

  clearInvalid : function (aID) 
  {
    document.getElementById(aID).removeAttribute("invalid");
  },

  clearErrorNotification : function () 
  {
    // OpenKioskDebug.print("CLEAR TIMEOUT", OpenKioskUtils.blockedPageTimeoutID);
    clearTimeout(OpenKioskUtils.blockedPageTimeoutID);
    OpenKioskAdmin.hideControl("openkiosk-error");
  },

  showControl : function (aID) 
  {
    // OpenKioskDebug.print("SHOW CONTROL", aID);

    OpenKioskAdmin.hideControls(0, aID);

    let el = document.getElementById(aID);

    if (!el) return;

    if (Services.prefs.getBoolPref("openkiosk.ui.notification.large.enabled")) el.setAttribute("size", "large");
    else el.removeAttribute("size");

    el.hidden = el.collapsed = false;
  },

  getOpenControl : function ()
  {
    let rv = null;

    let l = document.getElementById("openkiosk-login");
    let q = document.getElementById("openkiosk-quit");

    let p = document.getElementById("openkiosk-password");
    let qp = document.getElementById("openkiosk-quit-password");

    if (!l.collapsed) rv = p;
    else if (!q.collapsed) rv = qp;
  
    // OpenKioskDebug.print("LOGIN HIDDEN", l.collapsed);
    // OpenKioskDebug.print("QUIT HIDDEN", q.collapsed);

    return rv;
  },

  prompt : function (aQuit)
  {
    OpenKioskAdmin.hideControls();

    let p = document.getElementById(aQuit?"openkiosk-quit-password":"openkiosk-password");
    p.value = "";

    OpenKioskAdmin.showControl(aQuit?"openkiosk-quit":"openkiosk-login");
    OpenKiosk.showOSK();

    p.focus();
  },

  resetPasswordLogin : function ()
  {
    let lb = document.getElementById("openkiosk-login");

    if (lb.hasAttribute("invalid"))
    {
      lb.removeAttribute("invalid");

      let il = document.getElementById("invalid-password");
      il.value = "";
    }

    lb = document.getElementById("openkiosk-quit");

    if (lb.hasAttribute("invalid"))
    {
      lb.removeAttribute("invalid");

      let il = document.getElementById("invalid-quit-password");
      il.value = "";
    }
  },

  loginWithPassword : function ()
  {
    let p = document.getElementById("openkiosk-password");

    // just return if no value was entered
    if (!p.value) return;

    // if there is an old legacy pass then revert to 'admin'
    let savedPass = OpenKioskAdmin.pass || "admin";

    // issue fail alert if wrong pass is entered
    if (savedPass != p.value)
    {
      let sFail = OpenKioskAdmin.bundle.GetStringFromName("adminPasswordFail");

      document.getElementById("openkiosk-login").setAttribute("invalid", "true");
      document.getElementById("invalid-password").value = sFail;

      return;
    }

    // OpenKioskDebug.print("HIDE CONTROLS");
    OpenKioskAdmin.hideControls();

    p.value = "";

    OpenKioskAdmin._login();
  },

  quitWithPassword : function ()
  {
    let p = document.getElementById("openkiosk-quit-password");

    // just return if no value was entered
    if (!p.value) return;

    // if there is an old legacy pass then revert to 'admin'
    let savedPass = OpenKioskAdmin.pass || "admin";

    // issue fail alert if wrong pass is entered
    if (savedPass != p.value)
    {
      let sFail = OpenKioskAdmin.bundle.GetStringFromName("adminPasswordFail");

      let lb = document.getElementById("openkiosk-quit");
      lb.setAttribute("invalid", "true");

      let il = document.getElementById("invalid-quit-password");
      il.value = sFail;

      return;
    }

    OpenKioskAdmin.hideControls();

    p.value = "";

    OpenKioskAdmin.quit();
  },

  setUI : function ()
  {
    OpenKioskAdmin.setAdminPrefs(true);
    OpenKiosk.hideUI(true);
    switchToTabHavingURI(OpenKioskAdmin.prefURL, true);

    OpenKioskAdmin.showNotification();
  },

  showNotification : function ()
  {
    if (OpenKioskAdmin.adminMode) 
    {
      OpenKioskSession.resetAndClearAUPNotification();
      setTimeout(OpenKioskAdmin.notification, 100);
    }
  },

  notification : function ()
  {
    let collapsed = document.getElementById("openkiosk-admin").collapsed;

    if (!collapsed) return;

    let msg = OpenKioskAdmin.bundle.GetStringFromName("adminMode");

    document.getElementById("openkiosk-admin-msg").value = msg;

    OpenKioskAdmin.showControl("openkiosk-admin");
  },

  removeNotification : function ()
  {
    if (OpenKioskSession.aupNotification) return;

    OpenKioskAdmin.hideControls();
  },

  exit : function ()
  {
    OpenKioskAdmin.exiting = true;
    OpenKioskDebug.print("EXIT ADMIN");

    OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);

    OpenKioskAdmin.setAdminPrefs();
    OpenKioskAdmin.removeNotification();
    OpenKiosk._init();

    OpenKiosk.hideOSK();
    OpenKioskUtils.hideMenubar(true);

    OpenKioskUtils._setFullscreen();

    OpenKiosk.resetAttract();
    OpenKioskUtils.closeInsecureTabs();
    OpenKioskUtils.closeAllWindows();
    OpenKioskAdmin.clear();
    OpenKiosk.handleUIControls();
    OpenKiosk.handleNavigationKeys();
    // OpenKiosk.handleDevControls();
    OpenKiosk.hideUI();
    OpenKioskAdmin.exiting = false;
  },

  get clearOnExitEnabled ()
  {
    return Services.prefs.getBoolPref("openkiosk.admin.clearsession.onexit.enabled");
  },

  clear : function ()
  {
    // OpenKioskDebug.print("ADMIN CLEAR");
    if (OpenKioskAdmin.clearOnExitEnabled) 
    {
      OpenKioskSession.clear();
      OpenKioskSession.reinit();
      OpenKioskUtils.removeAllTabs();
    }
  },

  removeListeners : function ()
  {
    OpenKioskDebug.print("REMOVE LISTENERS");

    if (typeof(gBrowser) != "undefined")
    {
      gBrowser.removeProgressListener(openkioskProgressListener);
      gBrowser.tabContainer.removeEventListener("TabSelect", OpenKiosk.onTabSelect, true);
      gBrowser.tabContainer.removeEventListener("TabOpen", OpenKiosk.onNewTabOpened, true);
    }

    window.removeEventListener("MozDOMFullscreen:Entered", OpenKiosk.onEnterFullScreen, true, false);
    window.removeEventListener("MozDOMFullscreen:Exited", OpenKiosk.onExitFullScreen, true, false);
    window.removeEventListener("keydown", OpenKiosk.onKeyDown);
    window.removeEventListener("unload", OpenKiosk.unload);
    window.removeEventListener("focus", OpenKiosk.handleOSKFocus);
    // window.removeEventListener("click", OpenKiosk.handleOSKFocus);

    Services.prefs.removeObserver("browser.link.open_newwindow", OpenKiosk.prefObserver);
    Services.prefs.removeObserver("openkiosk.attractscreen.enabled", OpenKiosk.prefObserver);
    Services.prefs.removeObserver("openkiosk.fullscreen.enabled", OpenKiosk.prefObserver);

    Services.prefs.clearUserPref("openkiosk.contentframe.observers.added");
  },

  shutdown : function ()
  {
    OpenKioskAdmin.setAdminPrefs();
  },

  loginFromKeys : function ()
  {
    if (!Services.prefs.getBoolPref("openkiosk.keys.settings.enabled")) return;

    OpenKioskAdmin.login();
  },

  quitFromDOM : function ()
  {
    if (OpenKioskAdmin.adminMode) OpenKioskAdmin.quit();
    else OpenKioskAdmin.prompt(1);
  },

  quitFromKeys : function ()
  {
    if (!OpenKioskAdmin.adminMode && !Services.prefs.getBoolPref("openkiosk.keys.settings.enabled")) return;

    if (OpenKioskAdmin.adminMode) OpenKioskAdmin.quit();
    else OpenKioskAdmin.prompt(1);
  },

  quitFromButton : function ()
  {
    let check = (Services.prefs.getBoolPref("openkiosk.ui.quit.withpass.enabled") && !OpenKioskAdmin.adminMode);

    // OpenKioskDebug.print("PASS ENABLED", Services.prefs.getBoolPref("openkiosk.ui.quit.withpass.enabled"));

    if (check) OpenKioskAdmin.prompt(1);
    else OpenKioskAdmin.quit();
  },

  quit : function ()
  {
    OpenKioskAdmin.shutdown();
    Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup).quit(Ci.nsIAppStartup.eAttemptQuit);
  }
};

var openkioskProgressListener =
{
  onProgressChange : function (wp, req, cur, max, curtotal, maxtotal) {},

  onStateChange : function (wp, req, state, status) 
  { 
    if (!req) return;

    // OpenKioskDebug.print("ON STATE CHANGE", req.URI.spec);

    try { req.QueryInterface(Ci.nsIChannel); }
    catch (e) { /*OpenKioskDebug.error(e);*/ }

    if (wp.isTopLevel && state & Ci.nsIWebProgressListener.STATE_STOP) 
    {
      // OpenKioskDebug.print("STATE STOP", "CALL", "HANDLE HOME PAGE", req.URI.spec);

      if (req.URI.spec == "about:blank") return;

      OpenKiosk.handleHomePage(req.URI);
      // setTimeout(OpenKiosk.handleHomePage, 3000, req.URI);
    }

    if (wp.isTopLevel && state & Ci.nsIWebProgressListener.STATE_START) 
    {
      if (req instanceof Ci.nsIChannel || "URI" in req) 
      {
        // OpenKioskDebug.print("STATE_START");

        // no longer necessary 
        // if (OpenKiosk.handleAboutOpenKiosk(req)) return;

        OpenKiosk.setAttractPageLoaded(req.URI);

        let loc = req.originalURI;

        // OpenKioskDebug.print("onStateChange", "ENABLE JAVASCRIPT", "ENABLE", OpenKioskUtils.jsEnabled);
        // OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
        OpenKioskUtils.enableJavascript(true);

        OpenKiosk.handleMainToolbar();

        // OpenKioskDebug.print("ORIGINAL URI", loc.spec);

        if (OpenKioskSession.handleSanitizing()) return;

        // if a strict URI match doesn't work try comparing w/out the protocol as http sometimes gets server redirect to https
        if (OpenKioskUtils.exemptURI(loc) || OpenKioskUtils.exemptAbout(loc) || OpenKioskUtils.exemptExceptProtocolURI(loc)) return;

        if (!OpenKioskSession.handleProtocol(loc, req)) return;

        OpenKioskSession.handleAUP(loc, req);

        OpenKioskSession.handleFilters(loc, req);
      }
    }
      else if (!wp.isTopLevel)
    {
      if (/^http|^https/.test(req.aURI)) 
      {
        OpenKioskDebug.print("CANCEL REQUEST", req.URI.spec);
        OpenKioskUtils.cancelRequest(req);
      }
    }
  },

  onLocationChange : function (wp, req, loc) 
  {
    // if we switch tabs there is no request so return
    if (!req) return;

    if (loc.spec == "about:blank") return;

    if (!OpenKiosk.inited) 
    {
      OpenKioskUtils.emptyClipBoard();
      OpenKiosk.inited = true;
    }

    OpenKioskDebug.print("PAGE LOADED", loc.spec);

    OpenKioskAdmin.clearErrorNotification();

    if (loc.equals(gBrowser.currentURI)) OpenKioskSession.continue();

    OpenKioskAdmin.showNotification(); 

    if (OpenKioskSession.aupNotification) setTimeout(OpenKioskSession.showAUPNotification, 1);

    OpenKioskSession.resetAUP();
  },

  onStatusChange : function (wp, req, status, message) {},

  onSecurityChange : function (wp, req, state) {}
};

