// OPENKIOSK PREFERENCES

Preferences.addAll([
  { id: "openkiosk.preferences.selectedTabIndex", type: "int" },
  { id: "openkiosk.osk.enabled", type: "bool" },
  { id: "openkiosk.tabs.enabled", type: "bool" },
  { id: "openkiosk.attractscreen.enabled", type: "bool" },
  { id: "openkiosk.attractscreen.url", type: "string" },
  { id: "openkiosk.content.selection.enabled", type: "bool" },
  { id: "openkiosk.fullscreen.enabled", type: "bool" },
  { id: "openkiosk.redirectscreen.enabled", type: "bool" },
  { id: "openkiosk.redirectscreen.url", type: "string" },
  { id: "openkiosk.filters.enabled", type: "bool" },
  { id: "openkiosk.filters.whitelist.enabled", type: "bool" },
  { id: "openkiosk.javascript.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.about.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.blob.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.data.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.mailto.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.file.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.ftp.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.res.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.sms.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.tel.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.viewsource.enabled", type: "bool" },
  { id: "openkiosk.filters.protocol.javascript.enabled", type: "bool" },
  { id: "openkiosk.session.inactiveTerminal.enabled", type: "bool" },
  { id: "openkiosk.session.inactiveTerminal.minutes", type: "int" },
  { id: "openkiosk.session.inactiveTerminal.seconds", type: "int" },
  { id: "openkiosk.session.inactiveTerminal.warn.enabled", type: "bool" },
  { id: "openkiosk.session.inactiveTerminal.warn.seconds", type: "int" },
  { id: "openkiosk.session.inactiveTerminal.warn.manual.enabled", type: "bool" },
  { id: "openkiosk.session.diskcache.enabled", type: "bool" },
  { id: "openkiosk.session.history.enabled", type: "bool" },
  { id: "openkiosk.session.cookies.enabled", type: "bool" },
  { id: "openkiosk.session.aup.enabled", type: "bool" },
  { id: "openkiosk.session.aup.url", type: "string" },
  { id: "openkiosk.ui.urlbar.enabled", type: "bool" },
  { id: "openkiosk.ui.urlbar.context.enabled", type: "bool" },
  { id: "openkiosk.ui.personalbar.enabled", type: "bool" },
  { id: "openkiosk.ui.notification.large.enabled", type: "bool" },
  { id: "openkiosk.ui.master.zoom.size", type: "string" },
  { id: "media.autoplay.enabled", type: "bool" },
  { id: "openkiosk.ui.context.menu.enabled", type: "bool" },
  { id: "openkiosk.ui.context.search.enabled", type: "bool" },
  { id: "openkiosk.ui.statusbar.enabled", type: "bool" },
  { id: "openkiosk.ui.quit.withpass.enabled", type: "bool" },
  { id: "openkiosk.ui.personalbar.bookmarks.enabled", type: "bool" },
  { id: "openkiosk.ui.personalbar.bookmarks.context.enable", type: "bool" },
  { id: "print.always_print_silent", type: "bool" },
  { id: "openkiosk.print.web.enabled", type: "bool" },
  { id: "openkiosk.admin.externalapps.enabled", type: "bool" },
  { id: "openkiosk.admin.multimonitor.enabled", type: "bool" },
  { id: "openkiosk.keys.navigation.enabled", type: "bool" },
  { id: "openkiosk.keys.settings.enabled", type: "bool" },
  { id: "openkiosk.admin.clearsession.onexit.enabled", type: "bool" },
  { id: "openkiosk.downloads.enabled", type: "bool" },
  { id: "openkiosk.pdf.downloads.enabled", type: "bool" },
  { id: "openkiosk.file.upload.enabled", type: "bool"}
]);

var gOpenKioskPane = 
{
  _inited : false,

  init: function ()
  {
    this._inited = true;
    OpenKioskPreferences.init();
    OpenKioskUtils.initCrypto();
  }
};

var OpenKioskPreferences =
{
                   _win : null,
                _inited : false,
  filtersTexboxModified : false,
        mFiltersTextBox : null,
         mFiltersButton : null,
           mFiltersFile : null,
    mDefaultFiltersFile : "chrome://browser/content/filters.txt",
                mRelURL :"http://openkiosk.mozdevgroup.com/release115.html",

  log : function (aMsg)
  {
    Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService).logStringMessage(aMsg)
  },

  print : function ()
  {
    let msg = "OPENKIOSK:PREFERENCES: "+Array.from(arguments).join(": ");
    this.log(msg);
  },

  error : function ()
  {
    let msg = "OPENKIOSK:PREFERENCES:ERROR: "+Array.from(arguments).join(": ");
    this.log(msg);
  },

  init : function ()
  {
    // OpenKioskPreferences.print("init");

    // return if we are running as browser.xul
    if (!this.window.OpenKioskAdmin) return;

    try
    {
      this.setupEventListeners();

      this.mFiltersTextBox = document.getElementById("filtersEdit");
      this.mFiltersButton = document.getElementById("filtersSaveButton");

      try 
      { 
        this.mFiltersFile = Services.prefs.getComplexValue("openkiosk.filters.file", Ci.nsIFile); 

        if (this.mFiltersFile && !this.mFiltersFile.exists()) this.mFiltersFile = this.mDefaultFiltersFile;
      }
        catch (e) { this.mFiltersFile = this.mDefaultFiltersFile; }

      this.handleControls();

      var pref = Services.prefs.getIntPref("openkiosk.preferences.selectedTabIndex");

      /*****
      var okPrefs = document.getElementById("openkioskPrefs");

      if (pref != null) okPrefs.selectedIndex = pref;
      *****/

      this.loadFilters();

      setTimeout(this.setDefaultSearchEngine, 1000);

      this.setVersionInfo();

      this._inited = true;
    }
      catch (e) { OpenKioskPreferences.error(e); }
  },

  setupEventListeners : function () 
  {
    function setEventListener(aId, aEventType, aCallback) 
    {
      document.getElementById(aId).addEventListener(aEventType, aCallback.bind(OpenKioskPreferences));
    }

        setEventListener("filtersSaveButton", "command", function() { this.handleFiltersFile(); });
    setEventListener("custom-toolbar-button", "command", function() { this.customizeToolbar(); });
           setEventListener("reset-password", "command", function() { this.resetPassword(); });

    setEventListener("filtersEdit", "input", function() { this.handleFiltersTextInput(); });

             setEventListener("password", "input", this.setPassword);
              setEventListener("minutes", "input", this.ensureNumberValue);
              setEventListener("seconds", "input", this.ensureNumberValue);
    setEventListener("countdown-seconds", "input", this.ensureNumberValue);

    setEventListener("enableTabs", "click", this.enableTabBrowsing);

    setEventListener("ok-release-notes", "click", this.loadReleaseNotes);
    setEventListener("ok-about-build", "click", this.loadAboutBuild);
    setEventListener("enableOSK", "click", this.handleOSK);

    setEventListener("custom-icon-slider", "change", this.handleSlider);
  },

  setDefaultSearchEngine : function ()
  {
    try
    {
      if (Services.prefs.getBoolPref("openkiosk.preferences.firstTimeRun"))
      {
        OpenKioskPreferences.print("Set Default Search Engine");
        let engine = Services.search.getEngineByName("DuckDuckGo");
        Services.search.setDefault(engine, Ci.nsISearchService.CHANGE_REASON_USER);
 
        Services.prefs.setBoolPref("openkiosk.preferences.firstTimeRun", false);
      }
    }
      catch (e) { OpenKioskPreferences.error(e); }
  },

  get window ()
  {
    var rv = this._win;

    if (rv) return rv;

    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    rv = wm.getMostRecentWindow("navigator:browser");

    return rv;
  },

  enableTabBrowsing : function ()
  {
    Services.prefs.setIntPref('browser.link.open_newwindow', arguments[0].target.checked ? 3 : 1);
  },

  tabSelectionChanged : function ()
  {
    OpenKioskPreferences.print("tabSelectionChanged");
    if (!this._inited) return;

    var okPrefs = document.getElementById("openkioskPrefs");

    Services.prefs.setIntPref("openkiosk.preferences.selectedTabIndex", okPrefs.selectedIndex);

    OpenKioskPreferences.print("tabSelectionChanged", "END");
  },

  openNewTab : function (aURL)
  {
    var win = this.window;

    if (win) 
    {
      let tab = win.gBrowser.addTab(aURL, {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),});
      win.gBrowser.selectedTab = tab;
    }
  },

  displayPassword : function ()
  {
    document.getElementById("password").value = this.window.OpenKioskAdmin.pass;
  },

  setPassword : function ()
  {
    let p = document.getElementById("password").value;
    OpenKioskPreferences.print("setPassword", p);
    OpenKioskUtils.encryptAndSave(p);
    this.window.OpenKioskAdmin.pass = p;
  },

  resetPassword : function (aPass)
  {
    Services.prefs.clearUserPref("openkiosk.admin.password");

    // now get the default password
    let dp = Services.prefs.getCharPref("openkiosk.admin.password");
    document.getElementById("password").value = this.window.OpenKioskAdmin.pass = dp;
  },

  handleControls : function ()
  {
    let c = (Services.prefs.getIntPref("browser.link.open_newwindow") == 3);
    document.getElementById("enableTabs").checked = c; 

    // OpenKioskPreferences.print("ENABLE TABS", c);

    this.displayPassword();
  },

  handleEnableFullscreen : function ()
  {
    Services.prefs.getBoolPref("openkiosk.tabs.enabled") 
    ? Services.prefs.setIntPref("browser.link.open_newwindow", 3)
    : Services.prefs.setIntPref("browser.link.open_newwindow", 1);
  },

  setFiltersButtonToSave : function ()
  {
    this.filtersButton.label = "Save";
  },

  setFiltersButtonToChoose : function ()
  {
    this.filtersButton.label = "Choose...";
  },

  handleFiltersTextInput : function ()
  {
    if (!OpenKioskPreferences.filtersTextbox.value) 
    {
      this.setFiltersButtonToChoose();
      this.filtersTexboxModified = false;
      return;
    }

    if (this.filtersTexboxModified) return;

    this.setFiltersButtonToSave();

    this.filtersTexboxModified = true;
  },

  resetFiltersUI : function ()
  {
    // this.print("RESET FILTERS UI");

    OpenKioskPreferences.filtersTexboxModified = false;
    OpenKioskPreferences.setFiltersButtonToChoose();
    OpenKioskPreferences.window.OpenKioskSession.initFiltersData();
  },

  handleFiltersFile : function ()
  {
    // this.print("HANDLE FILTERS FILE");
    
    try
    {
      let btn = document.getElementById("filtersSaveButton");
      let fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
   
      let title = "Filters File";
      let mode = btn.label == "Save" ? Ci.nsIFilePicker.modeSave : Ci.nsIFilePicker.modeOpen;

      fp.init(window, title, mode);
      fp.appendFilters(Ci.nsIFilePicker.filterText);

      if (mode == Ci.nsIFilePicker.modeSave) fp.defaultString = "filters.txt";

      function cb (rv)
      {
        // this.print("CALLBACK");

        let f = fp.file;

        if (mode == Ci.nsIFilePicker.modeSave)
        {
          if (rv == Ci.nsIFilePicker.returnOK || rv == Ci.nsIFilePicker.returnReplace)
          {
            OpenKioskPreferences.print("WRITE TO FILE", f.path);
            OpenKioskUtils.writeToFile(OpenKioskPreferences.filtersTextbox.value, f, OpenKioskPreferences.resetFiltersUI);
            OpenKioskPreferences.filtersFile = f;
          }
        }

        if (mode == Ci.nsIFilePicker.modeOpen)
        {
          // OpenKioskPreferences.print("READ FILE", f.path, "TextBox", OpenKioskPreferences.filtersTextbox);
          const channel = NetUtil.newChannel({ uri: NetUtil.newURI(f), loadUsingSystemPrincipal: true, });
          OpenKioskUtils.readFile(channel, OpenKioskPreferences.filtersTextbox);
          OpenKioskPreferences.filtersFile = f;
        }
      }

      fp.open(cb);
    }
      catch (e) { OpenKioskPreferences.error(e); }
  },

  loadFilters : function ()
  {
    OpenKioskUtils.readURLIntoTextbox(this.filtersFile, OpenKioskPreferences.filtersTextbox);
  },

  get filtersFile ()
  {
    return this.mFiltersFile || this.mDefaultFiltersFile;
  },

  // set an nsIFile object
  set filtersFile (aFile)
  {
    Services.prefs.setComplexValue("openkiosk.filters.file", Ci.nsIFile, aFile);
    
    this.mFiltersFile = aFile;
  },

  get filtersTextbox ()
  {
    return this.mFiltersTextBox; 
  },

  get filtersButton ()
  {
    return this.mFiltersButton; 
  },

  customizeToolbar : function ()
  {
    try { this.window.gCustomizeMode.toggle(); }
    catch (e) { OpenKioskPreferences.error(e); }
  },

  ensureNumberValue : function ()
  {
    let tb = arguments[0].target;
    if (!/^\d+$/.test(tb.value)) tb.value = 0;

    switch (tb.id)
    {
      case "seconds":
      case "countdown-seconds":
      if (tb.value > 59) tb.value = 59;
      break;
    }
  },

  moreInfo : function ()
  {
    OpenKioskPreferences.openNewTab("http://openkiosk.mozdevgroup.com/faq.html#OSK");
  },

  loadReleaseNotes : function ()
  {
    OpenKioskPreferences.openNewTab(this.mRelURL);
  },

  loadAboutBuild : function ()
  {
    OpenKioskPreferences.openNewTab("about:buildconfig");
  },

  setVersionInfo : function ()
  {
    // insert the version of the XUL application (!= XULRunner platform version)
    let versionNum = Components.classes["@mozilla.org/xre/app-info;1"]
                               .getService(Components.interfaces.nsIXULAppInfo)
                               .version;
    let version = document.getElementById("version");
    version.textContent += " " + versionNum;

    // append user agent
    let ua = navigator.userAgent;
    if (ua) { document.getElementById("buildID").textContent += " " + ua; }
  },

  handleOSK : function ()
  {
    let on = arguments[0].target.checked;  

    // set the pref here so content click handler is properly set in time
    Services.prefs.setBoolPref("openkiosk.osk.enabled", on);

    OpenKioskPreferences.print("CHECKED", on);

    let ok = this.window.OpenKiosk;

    on ? ok.showOSK() : setTimeout(ok.hideOSK, 1000);
  },

  handleSlider : function ()
  {
    let val = arguments[0].target.value;

    // OpenKioskPreferences.print("handleSlider", val);

    Services.prefs.setCharPref("layout.css.devPixelsPerPx", val);
  },

  exit : function ()
  {
    this.window.OpenKioskAdmin.exit();
  },

  quit : function ()
  {
    Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup).quit(Ci.nsIAppStartup.eAttemptQuit);
  }
};

