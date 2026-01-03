const { E10SUtils } = ChromeUtils.import( "resource://gre/modules/E10SUtils.jsm");

var OpenKioskSession =
{
              timer : null,
             bundle : null,
            enabled : null,
            started : false,
       notification : false,
    aupNotification : false,
            minutes : null,
            seconds : null, 
               warn : null, 
           wseconds : null, 
           cseconds : null, 
       mouseStopped : true, 
         keyStopped : true, 
      scrollStopped : true, 
       clickStopped : true, 
    mouseEventTimer : null, 
      keyEventTimer : null, 
   scrollEventTimer : null, 
    clickEventTimer : null, 
     countdownTimer : null, 
           canceled : false, 
    needsSanitizing : false, 
     protocolString : [], 
      protocolRegEx : null, 
         aupEnabled : false, 
        aupAccepted : false, 
        aupDeclined : false, 
         aupUserURL : false, 
     filtersEnabled : false, 
   whitelistEnabled : false, 
        filtersData : null, 
        filtersFile : null,
  chromeFiltersFile : "chrome://browser/content/filters.txt",

  readPrefs : function ()
  {
             this.enabled = Services.prefs.getBoolPref("openkiosk.session.inactiveTerminal.enabled"); 
             this.minutes = Services.prefs.getIntPref("openkiosk.session.inactiveTerminal.minutes"); 
             this.seconds = Services.prefs.getIntPref("openkiosk.session.inactiveTerminal.seconds"); 
                this.warn = Services.prefs.getBoolPref("openkiosk.session.inactiveTerminal.warn.enabled");
            this.wseconds = Services.prefs.getIntPref("openkiosk.session.inactiveTerminal.warn.seconds"); 
          this.aupEnabled = Services.prefs.getBoolPref("openkiosk.session.aup.enabled");
      this.filtersEnabled = Services.prefs.getBoolPref("openkiosk.filters.enabled");
    this.whitelistEnabled = Services.prefs.getBoolPref("openkiosk.filters.whitelist.enabled");

    try 
    { 
      this.filtersFile = Services.prefs.getComplexValue("openkiosk.filters.file", Ci.nsIFile); 

      // OpenKioskDebug.print("FILTERS FILE", this.filtersFile, this.filtersFile.path, "EXISTS", this.filtersFile.exists());

      // turn filters pref file path into an nsIFile
      if (this.filtersFile && !this.filtersFile.exists()) this.filtersFile = null;
    }  
      catch (e) {}

    this.initValidProtocols();
  },

  clearPrefs : function ()
  {
    Services.prefs.clearUserPref("openkiosk.session.aup.accepted");
  },

  init : function ()
  {
    this.addListeners();
    this.clearPrefs();
    this.readPrefs();
    OpenKioskUtils.clearTabPrefs();
    this.initTimer();

    // init locals
    this.bundle = Services.strings.createBundle("chrome://openkiosk/locale/session.properties");
    this.setCountdownSeconds();
    this.initFiltersData();
  },

  reinit : function ()
  {
    OpenKioskDebug.print("SESSION REINIT");
    this.removeNotification();
    this.readPrefs();
    this.clearPrefs();
    this.resetTimer();
    this.resetEventTimers();
    this.setCountdownSeconds();

    this.countdownTimer = null;
    this.started = false;
    this.canceled = false;
  },

  setCountdownSeconds : function ()
  {
    // add 1 so that user will see the number 10 at start of countdown
    this.cseconds = this.wseconds+1;
  },

  get delay ()
  {
    // convert minutes and seconds to milliseconds
    let ms = ((this.minutes * 60 + this.seconds) * 1000);

    return ms;
  },

  initTimer : function ()
  {
    if (!OpenKioskSession.timer) OpenKioskSession.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

    if (!OpenKioskSession.enabled) return;

    // OpenKioskDebug.print("CANCEL TIMER");
    OpenKioskSession.timer.cancel();
    // OpenKioskSession.timer.initWithCallback(OpenKioskSession, OpenKioskSession.delay, OpenKioskSession.timer.TYPE_REPEATING_SLACK);
    OpenKioskSession.timer.initWithCallback(OpenKioskSession, OpenKioskSession.delay, OpenKioskSession.timer.TYPE_REPEATING_PRECISE);

    // OpenKioskDebug.print("INIT TIMER TO", OpenKioskSession.delay);
  },

  addListeners : function ()
  {
    addEventListener("mousemove", OpenKioskSession.invalidate, false);
    addEventListener("keyup", OpenKioskSession.invalidate, false);
    addEventListener("scroll", OpenKioskSession.invalidate, false);
    addEventListener("wheel", OpenKioskSession.invalidate, false);
    addEventListener("click", OpenKioskSession.invalidate, false);

    Services.prefs.addObserver("openkiosk.session.", OpenKioskSession.prefObserver, false);
    Services.prefs.addObserver("openkiosk.filters.", OpenKioskSession.prefObserver, false);
  },

  removeListeners : function ()
  {
    OpenKioskDebug.print("REMOVE SESSION LISTENERS");
    OpenKioskSession.clearTimer();

    removeEventListener("mousemove", OpenKioskSession.invalidate, false);
    removeEventListener("keyup", OpenKioskSession.invalidate, false);
    removeEventListener("scroll", OpenKioskSession.invalidate, false);
    removeEventListener("wheel", OpenKioskSession.invalidate, false);
    removeEventListener("click", OpenKioskSession.invalidate, false);

    Services.prefs.removeObserver("openkiosk.session.inactiveTerminal.", OpenKioskSession.prefObserver);
    Services.prefs.removeObserver("openkiosk.session.", OpenKioskSession.prefObserver);
    Services.prefs.removeObserver("openkiosk.filters.", OpenKioskSession.prefObserver);

    OpenKioskSession.clearPrefs();
  },
  
  resetTimer : function ()
  {
    // OpenKioskDebug.print("RESET TIMER");
    OpenKioskSession.initTimer();
  },

  clearTimer : function ()
  {
    // OpenKioskDebug.print("CLEAR TIMER", "DELAY", OpenKioskSession.delay);
    if (OpenKioskSession.timer)
    {
      OpenKioskSession.timer.cancel();
      OpenKioskSession.timer = null;
    }
  },

  clearTimers : function ()
  {
    OpenKioskSession.clearTimer();
    OpenKioskSession.resetWarningTimer();
  },

  resetWarningTimer : function (aStartSession)
  {
    clearTimeout(OpenKioskSession.countdownTimer);
    OpenKioskSession.countdownTimer = null;

    if (aStartSession) OpenKioskSession.sessionStarted();
  },

  resetEventTimers : function ()
  {
    OpenKioskSession.resetMouseTimer();
    OpenKioskSession.resetKeyTimer();
    OpenKioskSession.resetScrollTimer();
    OpenKioskSession.resetClickTimer();
  },

  resetMouseTimer : function ()
  {
    OpenKioskSession.mouseStopped = true;
  },

  resetKeyTimer : function ()
  {
    OpenKioskSession.keyStopped = true;
  },

  resetScrollTimer : function ()
  {
    OpenKioskSession.scrollStopped = true;
  },

  resetClickTimer : function ()
  {
    OpenKioskSession.clickStopped = true;
  },

  sessionStarted : function ()
  {
    if (!OpenKioskSession.timer) OpenKioskSession.initTimer();

    OpenKioskSession.resetTimer();
    OpenKioskSession.started = true;
  },

  handleMouseMove : function ()
  {
    clearTimeout(OpenKioskSession.mouseEventTimer);
    OpenKioskSession.mouseEventTimer = setTimeout(OpenKioskSession.resetMouseTimer, 1000);

    // return while mouse is moving
    if (!OpenKioskSession.mouseStopped) return;

    OpenKioskSession.mouseStopped = false;
  },

  handleKeyup : function ()
  {
    OpenKioskSession.sessionStarted();

    clearTimeout(OpenKioskSession.keyEventTimer);
    OpenKioskSession.keyEventTimer = setTimeout(OpenKioskSession.resetKeyTimer, 1000);

    // return while keyboard is active
    if (!OpenKioskSession.keyStopped) return;

    OpenKioskSession.keyStopped = false;
    OpenKioskDebug.print("KEYUP INVALIDATE");
    OpenKiosk.invalidateHomeAndAttractPage();
    OpenKioskSession.sessionStarted();
  },

  handleScroll : function ()
  {
    // OpenKioskDebug.print("HANDLE SCROLL");
    OpenKioskSession.sessionStarted();

    clearTimeout(OpenKioskSession.scrollEventTimer);
    OpenKioskSession.scrollEventTimer = setTimeout(OpenKioskSession.resetScrollTimer, 1000);

    // return while scrolling
    if (!OpenKioskSession.scrollStopped) return;

    OpenKioskSession.scrollStopped = false;
    OpenKiosk.invalidateHomeAndAttractPage();
    OpenKioskSession.sessionStarted();
  },

  handleClick : function ()
  {
    OpenKioskSession.sessionStarted();

    clearTimeout(OpenKioskSession.clickEventTimer);
    OpenKioskSession.clickEventTimer = setTimeout(OpenKioskSession.resetClickTimer, 1000);

    // return while clicking
    if (!OpenKioskSession.clickStopped) return;

    OpenKioskSession.clickStopped = false;
    OpenKiosk.invalidateHomeAndAttractPage();
    OpenKioskSession.sessionStarted();
  },

  handleMailtoClick : function (aEvent)
  {
    try
    {
      // OpenKioskDebug.print("handleMailtoClick", aEvent.target.nodeName);

      if (aEvent.target.nodeName.toLowerCase() != "a") return;

      OpenKioskDebug.print("URL", aEvent.target.href);

      let block = (/^mailto:/i.test(aEvent.target.href) && !Services.prefs.getBoolPref("openkiosk.filters.protocol.mailto.enabled")) ;

      OpenKioskDebug.print("BLOCK", block);

      if (block) aEvent.preventDefault();
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  invalidate : function ()
  {
    let event = arguments[0];

    // OpenKioskDebug.print("INVALIDATE", event.type, event.target);
 
    switch (event.type)
    {
      case "mousemove":
        OpenKioskSession.handleMouseMove();
        break;

      case "keyup":
        OpenKioskSession.handleKeyup();
        break;

      case "wheel":
      case "scroll":
        OpenKioskSession.handleScroll();
        break;

      case "click":
        OpenKioskSession.handleMailtoClick(event);
        OpenKioskSession.handleClick();
        if (event.target.id == "urlbar-input") OpenKiosk.showOSK();
        break;
    }
  },

  get isSoundPlaying ()
  {
    // if attract of fullscreen there is no UI so return false
    if (OpenKiosk.attractEnabled || OpenKiosk.fullscreenEnabled) return false;

    let tab = gBrowser.getTabForBrowser(gBrowser.selectedBrowser);

    return tab.soundPlaying;
  },

  startCountdown : function ()
  {
    try
    {
      // if we have a selection on the html page, invalidate the home page so we can reset it
      if (OpenKiosk.homePageLoaded) window.gBrowser.selectedBrowser.messageManager.sendAsyncMessage("OpenKiosk:GetSelection", {});
    }
      catch (e) { OpenKioskDebug.error(e); }

    OpenKioskSession._startCountdown();
  },

  _startCountdown : function ()
  {
    // don't start if we are on attract page
    if (OpenKiosk.attractEnabled && OpenKiosk.attractPageLoaded || OpenKiosk.homePageLoaded) return;

    OpenKioskDebug.print("START COUNTDOWN");

    // don't countdown unless a session was started
    if (OpenKioskSession.started && (!OpenKioskSession.isSoundPlaying || !OpenKiosk.fullscreenEntered))
    {
      OpenKioskSession.canceled = false;

      if (!OpenKioskSession.warn) 
      {
        // OpenKioskDebug.print("START COUNTDOWN", "NO WARN", "FINISH RESET");
        OpenKioskSession.finishReset();
      }
        else 
      {
        // OpenKioskDebug.print("START COUNTDOWN", OpenKioskSession.wseconds, "SECONDS", "started", OpenKioskSession.started);
        OpenKioskSession.setCountdownSeconds();
        OpenKioskSession.continueCountdown();
      }
    }
  },

  continueCountdown : function ()
  {
    --OpenKioskSession.cseconds;

    // OpenKioskDebug.print("continueCountdown", "cseconds", OpenKioskSession.cseconds, "wseconds", OpenKioskSession.wseconds);

    // clear the main timer while we are counting down
    if (OpenKioskSession.timer) OpenKioskSession.clearTimer();

    if (OpenKioskSession.cseconds >= 0)
    {
      OpenKioskSession.showNotification();
      OpenKioskSession.countdownTimer = setTimeout(OpenKioskSession.continueCountdown, 1000);
    }
      else
    {
      OpenKioskSession.finishReset();
    }
  },

  showAUPNotification : function ()
  {
    OpenKioskAdmin.showControl("openkiosk-aup");
  },

  showNotification : function ()
  {
    OpenKioskSession.notification = true;

    let msg = OpenKioskSession.bundle.GetStringFromName("sessionWarning");

    document.getElementById("openkiosk-warning-msg").value = msg;

    // format seconds
    let s = OpenKioskSession.cseconds;
    if (s < 10) s = " " + s;

    document.getElementById("openkiosk-warning-seconds").value = s;

    msg = OpenKioskSession.bundle.GetStringFromName("sessionWarningEnd");

    document.getElementById("openkiosk-warning-end").value = msg;

    OpenKioskAdmin.showControl("openkiosk-warning");
  },

  removeNotification : function ()
  {
    if (OpenKioskSession.aupNotification) return;

    // OpenKioskDebug.print("SESSION", "REMOVE NOTIFICATION", this.removeNotification.caller.name);

    OpenKioskAdmin.hideControl("openkiosk-aup");
    OpenKioskAdmin.hideControl("openkiosk-warning");

    OpenKioskSession.notification = false;
  },

  continue : function ()
  {
    OpenKioskSession.removeNotification();
    OpenKioskSession.resetWarningTimer(true);
    OpenKioskSession.resetTimer();
  },

  _continue : function ()
  {
    OpenKioskSession.resetWarningTimer(true);
    OpenKioskSession.resetTimer();
  },

  finishReset : function ()
  {
    OpenKioskDebug.print("FINISH COUNTDOWN");

    if (OpenKioskSession.canceled) 
    {
      OpenKioskDebug.print("CANCELED");
      OpenKioskSession.canceled = false;
      return;
    }

    OpenKioskSession.continue();
    OpenKioskSession.needsSanitizing = true;

    if (!Services.prefs.getBoolPref("openkiosk.session.history.enabled")) OpenKioskUtils.openNewTab("about:blank");
    else OpenKioskUtils.loadBlankPage();
    OpenKioskUtils._removeAllTabs();
    if (OpenKiosk.fullscreenEnabled) OpenKiosk.hideTabsToolbar();

    // since we are creating a newtab with the homepage our progress 
    // listener doesn't pick it up for sanitizing so let's do it here
    OpenKioskSession.handleSanitizing();
  },

  /**
   *  will be called from progressListener 
   *  after home page is loaded
   */
  clearAndReset : function ()
  {
    OpenKioskDebug.print("CLEAR AND RESET");

    OpenKioskSession.resetWarningTimer(true);
    OpenKioskSession.clear();
    OpenKioskSession.reinit();
    OpenKiosk.hideUI();
    OpenKioskSession.needsSanitizing = false;
  },

  handleSanitizing : function ()
  {
    // OpenKioskDebug.print("HANDLE SANITIZING", "NEEDS SANITIZING", OpenKioskSession.needsSanitizing);

    if (OpenKioskSession.needsSanitizing)
    {
      OpenKioskSession.clearAndReset();
      return true;
    }
    return false;
  },

  // clear user data and UI after session has ended 
  clear : function ()
  {
    OpenKioskDebug.print("CLEAR USER DATA");

    // make a call to utils for individual data clearing functions
    OpenKioskUtils.clearUserData();
  },

  cancel : function (aAdminMode)
  {
    OpenKioskSession.cseconds = -1;
    OpenKioskSession.canceled = true;
    OpenKioskSession.clearTimers(); 
    if (!aAdminMode) OpenKioskSession.removeNotification();
  },

  reset : function ()
  {
    // return if in admin mode
    if (OpenKioskAdmin.adminMode)
    {
      OpenKioskSession.cancel(1);
      return;
    }

    // return if session is active
    if (!OpenKioskSession.enabled       || 
        !OpenKioskSession.mouseStopped  || 
        !OpenKioskSession.keyStopped    ||
        !OpenKioskSession.scrollStopped ||
        !OpenKioskSession.clickStopped) 
      return;

    // OpenKioskDebug.print("START COUNTDOWN");
    OpenKioskSession.startCountdown();
  },

  forcedReset : function ()
  {
    OpenKioskSession.finishReset();
  },

  manualReset : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    if (OpenKioskSession.notification) return;

    OpenKioskSession.resetAndClearAUPNotification();

    OpenKioskDebug.print("MANUAL RESET SESSION");

    OpenKioskSession.started = true;
    OpenKioskSession.canceled = false;

    if (!Services.prefs.getBoolPref("openkiosk.session.inactiveTerminal.warn.manual.enabled")) 
    {
      OpenKioskSession.finishReset();
      return;
    }

    OpenKioskSession.startCountdown();
  },

  prefObserver : 
  {
    observe : function (subject, topic, data)
    {
      // OpenKioskDebug.print("SUBJECT", subject, "TOPIC", topic, "DATA", data);

      if (topic == 'nsPref:changed') 
      {
        if (/inactiveTerminal/.test(data))
        {
          OpenKioskSession.readPrefs();
          OpenKioskSession.resetTimer();
        }

        if (/protocol/.test(data)) OpenKioskSession.initValidProtocols();

        if (data == "openkiosk.filters.enabled") OpenKioskSession.filtersEnabled = Services.prefs.getBoolPref("openkiosk.filters.enabled");

        if (data == "openkiosk.filters.whitelist.enabled") OpenKioskSession.whitelistEnabled = Services.prefs.getBoolPref("openkiosk.filters.whitelist.enabled");

        if (data == "openkiosk.filters.file") 
        {
          try 
          { 
            OpenKioskSession.filtersFile = Services.prefs.getComplexValue("openkiosk.filters.file", Ci.nsIFile); 
            OpenKioskSession.initFiltersData();
          }
          catch (e) {}
        }

        if (/aup/.test(data)) 
        {
          if (data == "openkiosk.session.aup.accepted") OpenKioskSession.aupAccepted = Services.prefs.getBoolPref("openkiosk.session.aup.accepted");

          if (data == "openkiosk.session.aup.enabled") OpenKioskSession.aupEnabled = Services.prefs.getBoolPref("openkiosk.session.aup.enabled");
        }
      }
    }
  },

  notify : function ()
  {
    // OpenKioskDebug.print("TIMER NOTIFY", "SET TO", OpenKioskSession.delay/1000, "SECONDS");
    OpenKioskSession.reset();
  },

  initValidProtocols : function ()
  {
    this.protocolString = new Array;

    let about = Services.prefs.getBoolPref("openkiosk.filters.protocol.about.enabled");
    let blob = Services.prefs.getBoolPref("openkiosk.filters.protocol.blob.enabled");
    let data = Services.prefs.getBoolPref("openkiosk.filters.protocol.data.enabled");
    let email = Services.prefs.getBoolPref("openkiosk.filters.protocol.mailto.enabled");
    let file = Services.prefs.getBoolPref("openkiosk.filters.protocol.file.enabled");
    let ftp = Services.prefs.getBoolPref("openkiosk.filters.protocol.ftp.enabled");
    let javascript = Services.prefs.getBoolPref("openkiosk.filters.protocol.javascript.enabled");
    let res = Services.prefs.getBoolPref("openkiosk.filters.protocol.res.enabled");
    let sms = Services.prefs.getBoolPref("openkiosk.filters.protocol.sms.enabled");
    let tel = Services.prefs.getBoolPref("openkiosk.filters.protocol.tel.enabled");
    let viewsource = Services.prefs.getBoolPref("openkiosk.filters.protocol.viewsource.enabled");

    if (about) this.protocolString.push("about");
    if (blob) this.protocolString.push("blob");
    if (data) this.protocolString.push("data");
    if (email) this.protocolString.push("mailto");
    if (file) this.protocolString.push("file");
    if (ftp) this.protocolString.push("ftp");
    if (javascript) this.protocolString.push("javascript");
    if (res) this.protocolString.push("resource");
    if (sms) this.protocolString.push("tel");
    if (tel) this.protocolString.push("tel");
    if (viewsource) this.protocolString.push("view-source");

    this.protocolString = this.protocolString.join("|");

    this.protocolRegEx = new RegExp(this.protocolString);
  },

  handleProtocol : function (aURI, aReq)
  {
    if (OpenKioskUtils.downloadsFolder)
    {
       if (OpenKioskUtils.downloadsFolder.uri.equals(aURI)) return true;

       aURI instanceof Ci.nsIFileURL;

       OpenKioskDebug.print(aURI.file.parent.path, OpenKioskUtils.downloadsFolder.file.path);

       if (OpenKioskUtils.downloadsFolder.file.equals(aURI.file.parent)) return true;
    }

    if (!OpenKioskSession.isValidProtocol(aURI))
    {
      OpenKioskUtils.loadBlankPage();
      OpenKioskUtils.cancelRequestAndRedirect(aReq, aURI);
      return false;
    }

    return true;
  },

  validProtocols : function (aURI)
  {
    if (OpenKioskAdmin.adminMode) return true;

    if (/^http|^https|^wyciwyg/.test(aURI.scheme)) return true;

    return false;
  },

  isTabCrashed : function (aURI)
  {
    // chrome://global/skin/in-content/info-pages.css
    // chrome://browser/content/aboutTabCrashed.js

    return (aURI.spec == "chrome://global/skin/in-content/info-pages.css" ||
            aURI.spec == "chrome://browser/content/aboutTabCrashed.js")
  },

  isValidProtocol : function (aURI)
  {
    // OpenKioskDebug.print("PROTOCOL", aURI.scheme, aURI.spec);

    if (OpenKioskSession.validProtocols(aURI)) return true;

    if (OpenKioskSession.isTabCrashed(aURI)) return true;

    if (!this.protocolString || !this.protocolRegEx.test(aURI.scheme)) 
    {
      OpenKioskDebug.print("BLOCKED PROTOCOL", aURI.scheme);
      return false;
    }

    return true;
  },

  toggleAUPUI : function (aShow)
  {
    return;
  },

  isAUPURI : function (aURI)
  {
     return aURI.equals(OpenKioskUtils.mAUPURI);
  },

  isAUPEnabled : function ()
  {
    if (OpenKioskAdmin.adminMode) return false;

    // OpenKioskDebug.print("AUP ENABLED", OpenKioskSession.aupEnabled);

    return OpenKioskSession.aupEnabled;
  },

  loadAUP : function ()
  {
    OpenKioskUtils.loadURI(OpenKioskUtils.aupURI.spec);
  },

  resetAUP : function ()
  {
    // OpenKioskDebug.print("RESET AUP");

    OpenKioskSession.aupDeclined = false;
  }, 

  clearAndResetAUP : function ()
  {
    if (!OpenKioskSession.isAUPEnabled()) return;

    OpenKioskSession.resetAUP();
    OpenKioskUtils.loadHomePage();
  },

  isAUPHidden : function ()
  {
    return document.getElementById("openkiosk-aup").hidden;
  },

  handleAUP : function (aURI, aReq)
  {
    if (OpenKioskAdmin.adminMode || OpenKioskUtils.exemptURI(aURI)) return;

    if (OpenKioskSession.aupDeclined) return;

    // OpenKioskDebug.print("HANDLE AUP", "DECLINED", OpenKioskSession.aupDeclined);

    if (!OpenKioskUtils.exemptAbout(aURI))
    {
      if (OpenKioskSession.isAUPHidden()) OpenKioskSession.aupUserURL = new Array;

      if (OpenKioskSession.isAUPEnabled() && !OpenKioskSession.aupAccepted && !OpenKioskSession.aupDeclined)
      {
        OpenKioskUtils.cancelRequest(aReq);
        OpenKioskSession.showAUP();
        OpenKioskSession.aupUserURL.push({uri:aURI, browser:gBrowser.selectedBrowser});
      }
    }
  },

  resetAndClearAUPNotification : function ()
  {
    OpenKioskSession.clearAUPNotification();
    OpenKioskSession.removeNotification();
  },

  clearAUPNotification : function ()
  {
    OpenKioskSession.aupNotification = false;
  },

  showAUP : function ()
  {
    OpenKioskSession.aupNotification = true;
    OpenKioskSession.loadAUP();
  },

  aupLoadURI : function ()
  {
    let url = gBrowser.currentURI.spec;

    if (OpenKioskSession.aupUserURL) 
    {
      OpenKioskSession.aupUserURL.forEach(element => 
        { 
          // OpenKioskDebug.print("AUP LOAD URI", element.uri.spec);
          element.browser.loadURI(element.uri.spec, {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});
        }
      );
    }
      else OpenKioskUtils.loadURI(url);
  },

  acceptAUP : function ()
  {
    OpenKioskDebug.print("ACCEPT AUP");
    Services.prefs.setBoolPref("openkiosk.session.aup.accepted", true);
    OpenKioskSession.clearAUPNotification();
    OpenKioskSession.aupLoadURI();
  },

  declineAUP : function ()
  {
    OpenKioskDebug.print("DECLINE AUP");
    Services.prefs.setBoolPref("openkiosk.session.aup.accepted", false);
    OpenKioskSession.clearAUPNotification();
    OpenKioskSession.aupDeclined = true;
    OpenKioskSession.aupLoadURI();
  },

  parseFiltersData : function ()
  {
    OpenKioskSession.filtersData = null;

    if (!OpenKioskSession.filtersFile) 
    {
      // OpenKioskDebug.print("NO FILTERS FILE USE CHROME INSTEAD");

      function callback (inputStream, status)
      {
        if (!Components.isSuccessCode(status))
        {
          // Handle error!
          OpenKioskDebug.print("ERROR READING FILE");
          return;
        }

        let cstream = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
        cstream.init(inputStream, "UTF-8", 0, 0);


        cstream instanceof Ci.nsIUnicharLineInputStream;

        // OpenKioskDebug.print("INPUT STREAM", cstream);

        OpenKioskSession._readLine(cstream);
      }

      OpenKioskUtils.getURLInputStream(OpenKioskSession.chromeFiltersFile, callback);

      return;
    }
      else
    {
      // OpenKioskDebug.print("PARSE FILTERS DATA", OpenKioskSession.filtersFile.path, "WHITELIST ENABLED", OpenKioskSession.whitelistEnabled);

      var fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
      fis.init(OpenKioskSession.filtersFile, -1, -1, false);

      let lis = fis.QueryInterface(Ci.nsILineInputStream);

      OpenKioskSession._readLine(lis);

      fis.close();
    }
  },

  _readLine : function (aLIS)
  {
    let line = { value: "" };
    let more = false;
    let all = [];
    let strict = [];

    do
    {
      more = aLIS.readLine(line);

      let text = line.value;

      // OpenKioskDebug.print("FILTERS DATA", text);
  
      if (text && !/#/.test(text))
      {
        if (/STRICT/.test(text)) strict.push(OpenKioskSession.parseFiltersLine(text));
        else all.push(OpenKioskSession.parseFiltersLine(text));
      }
    } while (more);

    OpenKioskSession.filtersData = strict.concat(all);

    // OpenKioskDebug.print("FILTERS DATA", OpenKioskSession.filtersData);
  },

  /**
   * Example formats for a line
   * allowed[www.brooklynmuseum.org/programs/, ALL, JAVASCRIPT];
   * allowed[www.mozilla.org/projects/firefox/, STRICT, NOJAVASCRIPT];
   */
  parseFiltersLine : function (aLine)
  {
    let rv = [];

    if (!aLine) return rv;

    try
    {
      let match = /\[([^\\]*)\]/.exec(aLine);

      if (!match) return rv;

      let [url, mode, jsenabled] = match[1].split(',');

      url = url.replace(/\*\./g, "");

      // OpenKioskDebug.print("url", url);

      let uri = OpenKioskUtils.URIFixUpPerf(url);

      // OpenKioskDebug.print("uri", uri.spec);

      // if (!OpenKioskUtils.jsEnabled) jsenabled = "JAVASCRIPT";

      rv = [uri, OpenKioskUtils.stripWhiteSpace(mode), OpenKioskUtils.stripWhiteSpace(jsenabled)];
    }
      catch (e) { OpenKioskDebug.error(e); }

    // OpenKioskDebug.print("parseFiltersLine", rv);

    return rv;
  },

  initFiltersData : function ()
  {
    // OpenKioskDebug.print("INIT FILTERS DATA");
  
    this.parseFiltersData();

    // OpenKioskDebug.print("FILTERS DATA", this.filtersData);
  },

  wildcardMatch : function (aURI, aFilter)
  {
    OpenKioskDebug.print("WILD CARD", aURI.spec, aURI.scheme);

    let rv = false;

    try
    {
      // OpenKioskDebug.print("WILD CARD", "IN HOST", aURI.host, "FILTER HOST", aFilter.host.replace(/\*\./, ""));
      let r = aFilter.host.replace(/\*\./, "");

      rv = new RegExp(r).test(aURI.host);
    }
      catch (e) {}

    OpenKioskDebug.print("WILDCARD MATCH", "HOST", aURI.host, "FILTER HOST", aFilter.host, aURI.spec, rv ? "PASS" : "FAIL");

    return rv;
  },

  pathMatch : function (aRequest, aFilter)
  {
    let requestPath = aRequest.filePath;
    let filterPath = aFilter.filePath;

    OpenKioskDebug.print("requestPath", requestPath, "filterPath", filterPath);

    var filterLen;
    // Its not enough to check domains for regular URLs
    // e.g allowed[www.mozilla.org/projects/firefox/, ALL];
    filterLen = aFilter.length;
    reqLen = requestPath.len;

    // clean up filter root
    if (filterPath.charAt(filterLen-1) != "/")
    {
      filterPath += "/";
      filterLen = filterPath.length;
    }

    // There is method in the following madness!! - Brian
    choppedReq = requestPath.substring(0, filterLen);

    let hasAsterisk = /\*/.test(filterPath);
    OpenKioskDebug.print("ASTERISK", hasAsterisk);

    // remove wildcard
    OpenKioskDebug.print("BEFORE", filterPath);
    filterPath = filterPath.replace(/\*/, "");
    OpenKioskDebug.print("AFTER", filterPath);

    delimitChar = choppedReq.charAt(filterLen-1);

    if (hasAsterisk) 
    {
      let index = filterPath.lastIndexOf("/")+1;
      choppedReq = choppedReq.substring(0, index);
    }

    if (delimitChar != "")
    {
      if (delimitChar == "/" && choppedReq == filterPath) return true;
    }
      else
    {
      choppedReq += "/";
    }

    OpenKioskDebug.print("choppedReq", choppedReq, "filterPath", filterPath);

    if (choppedReq == filterPath) return true;

    OpenKioskDebug.print("PATH MATCH FAILED for URL", requestPath);

    return false;
  },

  stripBlob : function (aURI)
  {
    if (aURI.scheme != "blob") return aURI;

    let url = aURI.spec.replace("blob:", "");

    // OpenKioskDebug.print("STRIP BLOB", "URL", url);

    let newURI = OpenKioskUtils.newURI(url);
    
    return newURI;
  },

  // return true for matches whether white or black listed
  filterURI : function (aURI)
  {
    // OpenKioskDebug.print("FILTER URI", "FILTERS DATA", OpenKioskSession.filtersData);

    // OpenKioskDebug.print("FILTER URI", aURI.spec);

    aURI = OpenKioskSession.stripBlob(aURI);

    let rv = !OpenKioskSession.whitelistEnabled;

    function filter (o)
    {
      let uri = o[0];
      let mode = o[1];
      let jsenabled = o[2];

      // if javascript is empty then revert to default which is enabled
      let enableJS = (jsenabled != "NOJAVASCRIPT");

      // OpenKioskDebug.print("uri", uri.spec);

      // OpenKioskDebug.print(uri.spec, "jsenabled", jsenabled);

      // OpenKioskDebug.print(uri.spec, enableJS ? "TRUE" : "FALSE");

      // OpenKioskDebug.print("filter URI", uri.spec, "mode", mode);

      // OpenKioskDebug.print("EQUALS", uri.equals(aURI), "FILTER URI", uri.spec, "PAGE URI", aURI.spec, "JAVASCRIPT", enableJS, "WHITELIST ENABLED", OpenKioskSession.whitelistEnabled);

      let equalURIs = uri.equals(aURI);

      // this handles STRICT mode
      // if the URI's are equal then no need to proceed
      if (equalURIs) 
      {
        rv = OpenKioskSession.whitelistEnabled;

        OpenKioskUtils.handleJavascript(enableJS);

        return rv;
      }

      let wildcard = OpenKioskSession.wildcardMatch(aURI, uri);

      OpenKioskDebug.print("WILD CARD", wildcard); 

      if (mode == "STRICT" && wildcard && OpenKioskSession.pathMatch(aURI, uri))
      {
         OpenKioskDebug.print("STRICT", "WILD CARD & PATH MATCH"); 

         OpenKioskUtils.handleJavascript(enableJS);

         rv = OpenKioskSession.whitelistEnabled;
      }
 
      if (mode == "ALL")
      {
        if (wildcard)
        {
          // OpenKioskDebug.print("FILTERED URI", uri.spec, "IN URI", aURI.spec, "mode", mode, "enableJS", enableJS);

          OpenKioskUtils.handleJavascript(enableJS);

          rv = OpenKioskSession.whitelistEnabled;

          return rv;
        }
      }
    }

    OpenKioskSession.filtersData.forEach(filter);

    // OpenKioskDebug.print(rv ? "TRUE" : "FALSE");

    return rv;
  },

  handleFilters : function (aURI, aReq)
  {
    // OpenKioskDebug.print("HANDLE FILTERS", "ENABLED", OpenKioskSession.filtersEnabled, "FILE", OpenKioskSession.filtersFile);

    if (!OpenKioskSession.filtersEnabled || OpenKioskAdmin.adminMode) return;

    if (OpenKioskUtils.exemptExceptProtocolURI(aURI)) return;

    if (!OpenKioskSession.filterURI(aURI)) 
    {
      OpenKioskDebug.print("BLOCKED URL", aURI.spec);
      OpenKioskUtils.cancelRequestAndLoadBlankPage(aReq);
      OpenKioskUtils.showBlockedURLNotification(aURI);
    }
  }
}

