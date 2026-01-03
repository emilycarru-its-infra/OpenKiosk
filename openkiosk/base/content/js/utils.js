Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");
// Components.utils.import("resource://gre/modules/Task.jsm");

var OpenKioskUtils =
{
               mOK : null,
           mAUPURI : null,
              mKey : null,
       mAttractURI : null,
      mHomePageURI : null,
  mRedirectPageURI : null,
         jsEnabled : null,
   downloadsFolder : null,

  init : function ()
  {
    try { this.mOK = Cc["@mozilla.org/openkiosk;1"].createInstance(Ci.mozIOpenKiosk); }
    catch (e) { OpenKioskDebug.error(e); }

    this.initPrefs();
    this.addPrefObservers();
    this.initCrypto();
  },

  initPrefs : function ()
  {
    try
    {
      OpenKioskUtils.jsEnabled = Services.prefs.getBoolPref("openkiosk.javascript.enabled");

      // set global js to OK js setting
      OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
   
      let attractURL = Services.prefs.getCharPref("openkiosk.attractscreen.url") || Services.prefs.getCharPref("openkiosk.attractscreen.url.default");
      let redirectURL = Services.prefs.getCharPref("openkiosk.redirectscreen.url") || Services.prefs.getCharPref("openkiosk.redirectscreen.url.default");

      // OpenKioskDebug.print("UTILS", "ATTRACT URL", attractURL);

      OpenKioskUtils.mAUPURI = OpenKioskUtils.URIFixUp(Services.prefs.getCharPref("openkiosk.session.aup.url"));
      OpenKioskUtils.mAttractURI = OpenKioskUtils.URIFixUp(attractURL);
      OpenKioskUtils.mHomePageURI = OpenKioskUtils.URIFixUp(getDefaultHomePage());
      OpenKioskUtils.mRedirectPageURI = OpenKioskUtils.URIFixUp(redirectURL);

      // let synchronize browser history pref state w/ our pref state
      // Services.prefs.setBoolPref("places.history.enabled", Services.prefs.getBoolPref("openkiosk.session.history.enabled"));
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  addPrefObservers : function ()
  {
    Services.prefs.addObserver("openkiosk.session.aup.url", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.attractscreen.url", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.redirectscreen.url", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.javascript.enabled", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("openkiosk.session.history.enabled", OpenKioskUtils.prefObserver, false);
    // Services.prefs.addObserver("places.history.enabled", OpenKioskUtils.prefObserver, false);
    Services.prefs.addObserver("browser.startup.homepage", OpenKioskUtils.prefObserver, false);
  },

  prefObserver :
  {
    observe : function (subject, topic, data)
    {
      // OpenKioskDebug.print("SUBJECT", subject, "TOPIC", topic, "DATA", data);

      if (data == "openkiosk.javascript.enabled")     
      {
        OpenKioskUtils.jsEnabled = Services.prefs.getBoolPref("openkiosk.javascript.enabled");

        OpenKioskDebug.print("JAVASCRIPT PREF CHANGED", "SETTING TO", OpenKioskUtils.jsEnabled);

        // set global js to OK js setting
        OpenKioskUtils.enableJavascript(OpenKioskUtils.jsEnabled);
      }

      if (data == "places.history.enabled")     
      {
        // let synchronize our pref state w/ browser history pref state
        // Services.prefs.setBoolPref("openkiosk.session.history.enabled", Services.prefs.getBoolPref("places.history.enabled"));
      }
        else if (topic == 'nsPref:changed') OpenKioskUtils.initPrefs();
    }
  },

  removeListeners : function ()
  {
    Services.prefs.removeObserver("openkiosk.session.aup.url", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("openkiosk.attractscreen.url", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("openkiosk.redirectscreen.url", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("openkiosk.session.history.enabled", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("places.history.enabled", OpenKioskUtils.prefObserver);
    Services.prefs.removeObserver("browser.startup.homepage", OpenKioskUtils.prefObserver);
  },

  loadHomePage : function () 
  { 
    if (OpenKiosk.attractEnabled) OpenKiosk.loadAttractURI();
    else 
    {
      BrowserHome(); 
      OpenKiosk.homePageLoaded = true;
      // OpenKioskDebug.print("LOAD HOME PAGE", HomePage.get(), "homePageLoaded", OpenKiosk.homePageLoaded);
    }
  },

  openNewTab : function (aURL)
  {
    let tab = gBrowser.addTab(aURL, {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),});
    gBrowser.selectedTab = tab;
  },

  openDownloadsFolder : function (aFileFolder)
  {
    let uri = Services.io.newFileURI(aFileFolder);

    // store the downloads folder URI
    this.downloadsFolder = { uri:uri, file:aFileFolder };

    // OpenKioskDebug.print("FILE URL", uri.spec); 

    if (Services.prefs.getBoolPref("openkiosk.tabs.enabled"))
    {
      let tab = gBrowser.addTab(uri.spec, {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),});
      gBrowser.selectedTab = tab;
    }
      else
    {
      OpenKioskUtils.loadURI(uri.spec);
    }
  },

  loadNewTabPage : function () 
  { 
    if (OpenKioskAdmin.adminMode) return;

    OpenKioskDebug.print("NEW TAB CURRENT URI", gBrowser.currentURI.spec);

    if (gBrowser.currentURI.spec != "about:blank") return;

    OpenKioskDebug.print("NEW TAB LOAD HOME PAGE", HomePage.get());
    OpenKioskUtils.selectedBrowserLoadURI(HomePage.get());
    OpenKiosk.homePageLoaded = true;
  },

  loadRedirectPage : function (aTab) 
  { 
    // OpenKioskDebug.print("LOAD REDIRECT PAGE", "TAB", aTab);
    OpenKioskUtils.clearBlockedPageTimeout();

    if (aTab == gBrowser.selectedTab)
    {
      if (Services.prefs.getBoolPref("openkiosk.redirectscreen.enabled")) OpenKioskUtils.loadURI(OpenKioskUtils.redirectPageURI);
      else BrowserHome(); 
    }
  },

  selectedBrowserLoadURI : function (aURL) 
  { 
    gBrowser.selectedBrowser.loadURI(aURL, {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});
  },

  loadURI : function (aURL) 
  { 
    gBrowser.loadURI(aURL, {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});
  },

  loadBlankPage : function () 
  { 
    gBrowser.loadURI(Services.io.newURI("about:blank"), {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});
  },

  newURI : function (aURL) { return NetUtil.newURI(aURL); },

  URIFixUp : function (aURL)
  {
    // use blank page to handle uri's that may not be set like redirect page
    let rv = Services.io.newURI("about:blank", null, null);

    if (aURL)
    {
      try { rv = Services.uriFixup.getFixupURIInfo(aURL, Services.uriFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS).preferredURI; }
      catch (e) { OpenKioskDebug.error(e); }
    }

    return rv;
  },

  URIFixUpPerf : function (aURL) { return Services.uriFixup.getFixupURIInfo(aURL, Services.uriFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS).preferredURI; },

  get attractURI ()
  {
    return OpenKioskUtils.mAttractURI;
  },

  get aupURI ()
  {
    return OpenKioskUtils.mAUPURI;
  },

  get homeOrAttractPageURI ()
  {
    return OpenKiosk.attractEnabled ? OpenKioskUtils.attractURI : OpenKioskUtils.homePageURI;
  },

  get homePageURI ()
  {
    return OpenKioskUtils.URIFixUp(HomePage.get(window));
  },

  get redirectPageURI ()
  {
    return OpenKioskUtils.mRedirectPageURI;
  },

  cancelRequest : function (aReq)
  {
    try { if (aReq) aReq.cancel(Cr.NS_BINDING_ABORTED); }
    catch (e) {}
  },

  blockedPageTimeoutID : null,
  clearBlockedPageTimeout : function () { OpenKioskUtils.blockedPageTimeoutID = null; },

  cancelRequestAndRedirect : function (aReq, aURI)
  {
    // OpenKioskDebug.print("CANCEL REQUEST", aReq, typeof(aReq), aURI);

    try { if (aReq) aReq.cancel(Cr.NS_BINDING_ABORTED); }
    catch (e) { OpenKioskUtils.loadBlankPage(); }

    OpenKioskUtils.loadBlankPage();

    OpenKioskUtils.showBlockedURLNotification(aURI);

    setTimeout(OpenKioskUtils.loadRedirectPage, 2000, gBrowser.selectedTab);
  },

  cancelRequestAndLoadBlankPage : function (aReq)
  {
    // OpenKioskDebug.print("REQUEST", aReq);

    try { if (aReq) aReq.cancel(Cr.NS_BINDING_ABORTED); }
    catch (e) { /*OpenKioskDebug.error(e);*/ }

    OpenKioskUtils.loadBlankPage();

    OpenKioskUtils.blockedPageTimeoutID = setTimeout(OpenKioskUtils.loadRedirectPage, 3000, gBrowser.selectedTab);
  },

  exemptURI : function (aURI)
  {
    return aURI.equals(this.homePageURI) || aURI.equals(this.aupURI) || aURI.equals(this.attractURI) || aURI.equals(this.mRedirectPageURI);
  },

  exemptExceptProtocolURI : function (aURI)
  {
    // OpenKioskDebug.print("exemptExceptProtocolURI", aURI.scheme);

    if (!/^http|^https/.test(aURI.scheme)) return false;

    let url = aURI.host + aURI.path;
    let sURL = this.aupURI.host + this.aupURI.path;

    if (url == sURL) return true;

    // ignore if attract URI hasn't been set
    if (this.attractURI.spec != "about:blank")
    {
      sURL = this.attractURI.host + this.attractURI.path;

      if (url == sURL) return true;
    }

    // home page doesn't always have a host eg: about:blank
    try
    {
      sURL = this.homePageURI.host + this.homePageURI.path; 

      if (url == sURL) return true;
    }
      catch (e) {}

    return false;
  },

  exemptAbout : function (aURI)
  {
    // OpenKioskDebug.print("EXEMPT ABOUT", aURI.spec, /^about:preferences#openKiosk/.test(aURI.spec));

    if (OpenKioskAdmin.adminMode && /^about:preferences#openKiosk/.test(aURI.spec)) return true;

    if (/^about:blank|^about:reader|^about:newtab|^about:document-onload-blocker/.test(aURI.spec)) return true;

    return false;
  }, 

  equalsDomainURI : function (aURIOne, aURITwo)
  {
    let uriOne = aURIOne.spec.replace(aURIOne.scheme, "").replace("://", "").replace(/^www\./, "");
    let uriTwo = aURITwo.spec.replace(aURITwo.scheme, "").replace("://", "").replace(/^www\./, "");

    let rv = aURIOne.equals(aURITwo) || (uriOne == uriTwo);

    // OpenKioskDebug.print(rv ? "EQUAL" : "NOT EQUAL", "URI ONE", uriOne, "URI TWO", uriTwo);

    return rv;
  },

  // Ensure tabs loaded match multiple home page URI
  equalsMultipleURIs : function (aURI)
  {
    let homePageArray = aURI.spec.split("|");

    if (gBrowser.browsers.length != homePageArray.length) return false;

    let isValid = true;

    for (let i=0; i<gBrowser.browsers.length; ++i)
    {
      let hp = OpenKioskUtils.URIFixUp(homePageArray[i]); 
      let uri = gBrowser.browsers[i].currentURI;

      if (!OpenKioskUtils.equalsDomainURI(hp, uri))
      {
        isValid = false;
        break;
      }
    }

    return isValid;
  },

  byteArrayToHexString : function (aByteArray)
  {
    let rv = "";
    let nextHexByte;

    for (let i=0; i<aByteArray.byteLength; i++) 
    {
      nextHexByte = aByteArray[i].toString(16); 

      if (nextHexByte.length < 2) nextHexByte = "0" + nextHexByte;

      rv += nextHexByte;
    }

    return rv;
  },

  hexStringToByteArray : function (aHexString) 
  {
    if (aHexString.length % 2 !== 0) throw "Must have an even number of hex digits to convert to bytes";

    let numBytes = aHexString.length / 2;
    let rv = new Uint8Array(numBytes);

    for (let i=0; i<numBytes; i++) rv[i] = parseInt(aHexString.substr(i*2, 2), 16);

    return rv;
  },

  convertArrayBufferViewtoString : function (aBuf)
  {
    // OpenKioskDebug.print("convertArrayBufferViewtoString", "LENGTH", aBuf.byteLength);

    let rv = "";

    for (let i=0; i<aBuf.byteLength; i++) rv += String.fromCharCode(aBuf[i]);

    return rv;
  },

  sha256 : function (aStr) 
  {
    let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Ci.nsIScriptableUnicodeConverter);

    converter.charset = "UTF-8";

    // Data is an array of bytes.
    let data = converter.convertToByteArray(aStr, {});
    let hasher = Cc["@mozilla.org/security/hash;1"]
                   .createInstance(Ci.nsICryptoHash);

    hasher.init(hasher.SHA256);
    hasher.update(data, data.length);

    return hasher.finish(true);
  },

  initCrypto : function ()
  {
    let exportedKey = Services.prefs.getCharPref("openkiosk.crypto.key");

    if (!exportedKey) OpenKioskUtils.generateKey();
    else OpenKioskUtils.importKey(exportedKey);

  },

  encrypt : function (aStr)
  {
    var crypto = Cc["@mozilla.org/login-manager/crypto/SDR;1"].getService(Ci.nsILoginManagerCrypto);
    var rv = crypto.encrypt(aStr);

    return rv;
  },

  decrypt : function (aStr)
  {
    var crypto = Cc["@mozilla.org/login-manager/crypto/SDR;1"].getService(Ci.nsILoginManagerCrypto);
    var rv = crypto.decrypt(aStr);

    return rv;
  },

  saveKeyAsPref : function (aKey)
  {
    let hash = OpenKioskUtils.byteArrayToHexString(new Uint8Array(aKey));

    OpenKioskDebug.print("SAVE KEY AS PREF", hash);

    Services.prefs.setCharPref("openkiosk.crypto.key", hash);
  },

  importKey : function (aKey)
  {
    let aeskey = OpenKioskUtils.hexStringToByteArray(aKey);

    // OpenKioskDebug.print("IMPORT KEY", aKey, aeskey);

    let importPromise = window.crypto.subtle.importKey(
                                                       "raw",                          // Exported key format
                                                       aeskey,                         // The exported key
                                                       {name: "AES-CBC", length: 128}, // Algorithm the key will be used with
                                                       true,                           // Can extract key value to binary string
                                                       ["encrypt", "decrypt"]          // Use for these operations
                                                      );

    importPromise.then(key => OpenKioskUtils.mKey = key);
    importPromise.catch(e => OpenKioskDebug.error(e.message));
  },

  exportKey : function (aKey)
  {
    // OpenKioskDebug.print("EXPORT AES KEY", aKey);

    let promiseExportKey = window.crypto.subtle.exportKey("raw", aKey);

    promiseExportKey.then(key => OpenKioskUtils.saveKeyAsPref(key));
    promiseExportKey.catch(e => OpenKioskDebug.error(e.message));
  },

  generateKey : function ()
  {
    let keyPromise = window.crypto.subtle.generateKey(
                                                      {name: "AES-CBC", length: 128}, // Algorithm the key will be used with
                                                      true,                           // Can extract key value to binary string
                                                      ["encrypt", "decrypt"]          // Use for these operations
                                                     );

    keyPromise.then(key => OpenKioskUtils.exportKey(key));
    keyPromise.catch(e => OpenKioskDebug.error(e.message));
  }, 

  encryptAndSave : function (aStr)
  {
    // OpenKioskDebug.print("ENCRYPT AND SAVE", aStr);

    let aeskey = OpenKioskUtils.mKey;

    if (!aeskey) 
    {
      OpenKioskDebug.error("ENCRYPT", "NO IMPORTED KEY FOUND!");
      return;
    }

    // Initialization Vector
    let iv = window.crypto.getRandomValues(new Uint8Array(16));

    let l = aStr.length;
    let bytes = new Uint8Array(l);

    for (let i=0; i<l; i++) bytes[i] = aStr.charCodeAt(i);

    var encryptPromise = window.crypto.subtle.encrypt(
                                                      {name: "AES-CBC", iv: iv}, // Random data for security
                                                      aeskey,                    // The key to use 
                                                      bytes                      // Data to encrypt
                                                     );

    encryptPromise.then(cipher => Services.prefs.setCharPref("openkiosk.admin.password", OpenKioskUtils.byteArrayToHexString(iv) +","+OpenKioskUtils.byteArrayToHexString(new Uint8Array(cipher))));
    encryptPromise.catch( e => OpenKioskDebug.error("ENCRYPT", e.message));
  },

  decryptGlobal : function (aStr)
  {
    let a = aStr.split(",");

    if (a.length == 1)
    {
      OpenKioskDebug.print("LEGACY PASSWORD RETURNING");
      Services.prefs.clearUserPref("openkiosk.admin.password");
      return;
    }

    // OpenKioskDebug.print("DECRYPT GLOBAL", "ARRAY", a, "LENGTH", a.length);

    let aeskey = OpenKioskUtils.mKey;

    if (!aeskey) 
    {
      OpenKioskDebug.error("DECRYPT", "NO IMPORTED KEY FOUND!");
      return;
    }

    let iv = OpenKioskUtils.hexStringToByteArray(a[0]);
    let d = OpenKioskUtils.hexStringToByteArray(a[1]);

    let decryptPromise = window.crypto.subtle.decrypt(
                                                      {name: "AES-CBC", iv: iv},
                                                      aeskey,
                                                      d
                                                     );

    decryptPromise.then(buf => OpenKioskAdmin.pass = OpenKioskUtils.convertArrayBufferViewtoString(new Uint8Array(buf)));
    decryptPromise.catch( e => OpenKioskDebug.error("DECRYPT", e.message));
  },

  _sizeWindow : function ()
  {
    var height = screen.height;
    var width = screen.width;

    OpenKioskDebug.print("_sizeWindow", width, height);
    window.resizeTo(width, height);
  },

  sizeWindow : function ()
  {
#ifdef XP_LINUX
    var height = screen.height;
    var width = screen.width;

    OpenKioskDebug.print("sizeWindow", width, height);
    window.resizeTo(width, height);
#endif
  },

  sizeWindowIf : function ()
  {
#ifdef XP_WIN
    OpenKioskUtils.setFullscreen();
#endif
  },

  resizeWindow : function ()
  {
#ifdef XP_WIN
    let height = screen.availHeight+10;
    let width = screen.width+20;
#else
    let height = screen.availHeight;
    let width = screen.width;
#endif

    window.moveTo(-10, 0);

    OpenKioskDebug.print("RESIZE WINDOW", width, height);
    window.resizeTo(width, height);
  },

  setFullscreen : function ()
  {
#ifdef XP_LINUX 
    OpenKioskDebug.print("SET FULL SCREEN");
    window.fullScreen = true;
#endif
  },  

  _setFullscreen : function ()
  {
    OpenKioskDebug.print("SET FULLSCREEN");
    window.fullScreen = true;

  },

  lockScreen : async function () 
  { 
#ifdef XP_MACOSX
    OpenKioskUtils.mOK.setOpenKioskUIMode(0);
    OpenKioskUtils._setFullscreen();
#endif
  },

  relockScreen : async function () 
  { 
#ifdef XP_MACOSX
    OpenKioskAdmin.exit();
    OpenKioskUtils.lockScreen();
#endif
  },

  unsetFullscreen : function ()
  {
    OpenKioskDebug.print("UNSET FULLSCREEN");
    window.fullScreen = false;
  },

  setOpenKioskUIMode : function (aIsAdmin)
  {
#ifdef XP_WIN
    // OpenKioskDebug.print("KILL EXPLORER");
    // OpenKioskUtils.mOK.killExplorer();
#endif

    OpenKioskUtils.mOK.setOpenKioskUIMode(aIsAdmin);
  },

  hideURLBar : function (aHide)
  {
    // OpenKioskDebug.print("HIDE URL BAR", aHide);

    if (!aHide) OpenKioskAdmin.showControl("urlbar")
    else OpenKioskAdmin.hideControl("urlbar");
  },

  showMainMenubar : function (aShow)
  {
    // OpenKioskDebug.print("SHOW MAIN MENUBAR", aShow);

#ifdef XP_LINUX
    window.fullScreen = !aShow;
#endif
    CustomizableUI.setToolbarVisibility("toolbar-menubar", aShow);
  },

  hideMenubar : function (aHide)
  {
    OpenKioskDebug.print("MENUBAR", aHide ? "HIDE" : "SHOW");

#ifdef XP_MACOSX
    // OpenKioskUtils.setFullscreen();
#endif

    let hide = (aHide == true);

#ifndef XP_MACOSX
    OpenKioskUtils.showMainMenubar(!hide);
#endif

#ifndef XP_LINUX
    // enable Menubar on OSX
    // OpenKioskUtils.mOK.setOpenKioskUIMode(!aHide);
#endif

    if (aHide) OpenKioskUtils.sizeWindow();
    else 
    {
      OpenKioskUtils.resizeWindow();
      // setTimeout(OpenKioskUtils.resizeWindow, 1000);
      // setTimeout(OpenKioskUtils.resizeWindow, 3000);
    }
  },

  closeTargetTab : function (aURL)
  {
    let l = gBrowser.browsers.length;

    let r = new RegExp(aURL);

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];
      let url = b.currentURI.spec;

      if (r.test(url)) 
      {
        let t = gBrowser.getTabForBrowser(b);
        gBrowser.removeTab(t);
        break;
      }
    }
  },

  closePrefTab : function ()
  {
    OpenKioskUtils.closeTargetTab("about:preferences");
  },

  closeTabPopup : function ()
  {
    let popup = document.getElementById("tabContextMenu");

    popup.hidePopup();
  }, 

  closeInsecureTabs : function ()
  {
    OpenKioskUtils.closeTargetTab("about:preferences");
    OpenKioskUtils.closeTargetTab("about:downloads");
    OpenKioskUtils.closeTargetTab("about:addons");
    OpenKioskUtils.closeTargetTab("moz-extension");
    gCustomizeMode.exit();
  },

  clearAllTabs : function ()
  {
    gBrowser.removeAllTabsBut(gBrowser.selectedTab);
  },

  removeAllTabs : function ()
  {
    OpenKioskUtils._removeAllTabs();

    OpenKioskUtils.loadHomePage();
  },

  _removeAllTabs : function ()
  {
    OpenKioskDebug.print("REMOVE ALL TABS");

    OpenKioskUtils.enableJavascript(true);

    OpenKioskUtils.clearAllTabs();

    OpenKioskUtils.closeTabPopup();
  },

  unpinTabs : function ()
  {
    OpenKioskDebug.print("UNPIN TAB");

    for (let i=0; i<gBrowser.tabs.length; i++)
    {
      let tab = gBrowser.tabs[i];
      // tab.setAttribute("pinned", true);
      // tab.pinned = true;
      OpenKioskDebug.print("TAB", "PINNED", tab.pinned);
      gBrowser.unpinTab(tab);
    }
  },

  clearUserData : function ()
  {
    OpenKioskUtils.zoomReset();
    OpenKioskUtils.clearTabPrefs();
    OpenKioskUtils.emptyClipBoard();
    OpenKioskUtils.clearBookmarks();
    OpenKioskSession.toggleAUPUI();
    OpenKioskUtils.sanitize();
  },

  // clear all user data
  sanitize : async function ()
  {
    // let placesHistoryEnabled = Services.prefs.getBoolPref("places.history.enabled");

    // OpenKioskDebug.print("SANITIZE");

    OpenKioskUtils.loadBlankPage();

    OpenKioskSession.aupAccepted = false;

    try
    {
      // turn off this pref so we can purge history
      // Services.prefs.setBoolPref("places.history.enabled", false);

      let itemsToClear = new Array;
      let preserveHistory = Services.prefs.getBoolPref("openkiosk.session.history.enabled");

      if (!Services.prefs.getBoolPref("openkiosk.session.cookies.enabled")) itemsToClear.push("cookies");
      if (!Services.prefs.getBoolPref("openkiosk.session.diskcache.enabled")) itemsToClear.push("cache", "sessions");

      if (!preserveHistory) itemsToClear.push("history");

      itemsToClear.push("formdata", "downloads");

      /****
      OpenKioskDebug.print("########");
      OpenKioskDebug.print("ITEMS TO CLEAR", itemsToClear);
      OpenKioskDebug.print("########");
      ****/

      function completed ()
      {
        // OpenKioskDebug.print("SANITIZE COMPLETED");
        OpenKioskUtils.loadHomePage();
        if (!preserveHistory) Services.obs.notifyObservers(null, "browser:purge-session-history", true);
      }
      await Sanitizer.sanitize(itemsToClear).then(completed);

      if (PrivateBrowsingUtils.isWindowPrivate(window)) os.notifyObservers(null, "last-pb-context-exited", "");

      // now restore it to it's original setting
      // Services.prefs.setBoolPref("places.history.enabled", placesHistoryEnabled);
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  zoomReset : function ()
  {
    let l = gBrowser.browsers.length;

    for (i=0; i<l; i++)
    {
      let b = gBrowser.browsers[i];

      Services.obs.notifyObservers(b, "browser-fullZoom:zoomReset", "");
    }

    let cps2 = Cc["@mozilla.org/content-pref/service;1"].getService(Ci.nsIContentPrefService2);
    cps2.removeByName("browser.content.full-zoom", null);
  },

  clearTabPrefs : function ()
  {
    Services.prefs.clearUserPref("browser.newtabpage.enabled");
    Services.prefs.clearUserPref("browser.newtabpage.enhanced");
    Services.prefs.clearUserPref("browser.newtabpage.storageVersion");
  },

  emptyClipBoard : function ()
  {
    try
    {
      let ch = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);

      try
      {
        // OS's that support selection like Linux
        // let supportsSelect = Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard).supportsSelectionClipboard();
        let supportsSelect = Services.clipboard.isClipboardTypeSupported(Services.clipboard.kSelectionClipboard);

        if (supportsSelect) ch.copyStringToClipboard("", Ci.nsIClipboard.kSelectionClipboard);

        ch.copyStringToClipboard("", Ci.nsIClipboard.kGlobalClipboard);

      }
        catch (e) { OpenKioskDebug.error(e); }

    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  clearBookmarks : function ()
  {
    if (Services.prefs.getBoolPref("openkiosk.ui.personalbar.bookmarks.enabled")) return;

    // OpenKioskDebug.print("CLEAR BOOKMARKS");

    try
    {
      PlacesUtils.bookmarks.eraseEverything();
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  clearHistory : function ()
  {
    OpenKioskDebug.print("CLEAR HISTORY");

    try
    {
      var s = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
      PlacesUtils.bhistory.removePagesByTimeframe(s, Date.now());
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  closeAllWindows : function ()
  {
    // OpenKioskDebug.print("CLOSE ALL WINDOWS");

    let wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
 
    let e = wm.getEnumerator(null);

    while (e.hasMoreElements()) 
    {
      let w = e.getNext();

      let type = w.document.documentElement.getAttribute("windowtype");
      // OpenKioskDebug.print("WINDOW", w, "TYPE", type);

      if (type != "navigator:browser") w.close();
    }
  },

  stripWhiteSpace : function (aStr)
  {
    return aStr ? aStr.replace(/^\s*(.*)\s*$/, "$1") : "";
  },

  // read chromeURL data into a textbox 
  getURLInputStream : function (aURL, aCallback)
  {
    let netChannel = NetUtil.newChannel
    ({
      uri: this.newURI(aURL),
      loadUsingSystemPrincipal: true,
    });

    NetUtil.asyncFetch(netChannel, aCallback);
  },

  // read chromeURL data into a textbox 
  readURLIntoTextbox : function (aURL, aEl)
  {
    function callback (inputStream, status)
    {
      if (!Components.isSuccessCode(status)) 
      {
        // Handle error!
        OpenKioskDebug.print("ERROR READING FILE", aURL);
        return;
      }

      let data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
      aEl.value = data;
    }

    let netChannel = NetUtil.newChannel
    ({
      uri: this.newURI(aURL),
      loadUsingSystemPrincipal: true,
    });

    NetUtil.asyncFetch(netChannel, callback);
  },

  // write data to an nsIFile
  writeToFile : function (aData, aFile, aCallback=null)
  {
    try
    {
      let ostream = FileUtils.openSafeFileOutputStream(aFile);

      let converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
      converter.charset = "UTF-8";
      let istream = converter.convertToInputStream(aData);

      NetUtil.asyncCopy(istream, ostream, aCallback);
    }
      catch (e) { OpenKioskDebug.error(e); }
  },

  // read file data into textbox value
  readFile : function (aFile, aEl)
  {
    function callback (inputStream, status)
    {
      if (!Components.isSuccessCode(status)) 
      {
        // Handle error!
        OpenKioskDebug.print("ERROR READING FILE", aFile.path);
        return;
      }

      let data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
      aEl.value = data;
    }

    NetUtil.asyncFetch(aFile, callback);
  },

  showBlockedURLNotification : function (aURI)
  {
    OpenKioskSession.clearAUPNotification();
    OpenKioskUtils.notification(aURI);
  },

  alertPopup : function (aURI)
  {
    Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
      .showAlertNotification(null, "Blocked Page", aURI.spec, false, '', null);
  },

  notification : function (aURI)
  {
    let page = OpenKioskSession.bundle.GetStringFromName("blockedPage");
    let msg = page+":  "+aURI.spec;

    document.getElementById("openkiosk-error-msg").value = msg;

    OpenKioskAdmin.showControl("openkiosk-error");
  },

  removeNotification : function ()
  {
    if (OpenKioskSession.aupNotification) return;

    // OpenKioskDebug.print("UTILS", "REMOVE NOTIFICATION");

    let b = gBrowser.selectedBrowser;
    let nb = gBrowser.getNotificationBox(b);

    if (nb.currentNotification) nb.removeCurrentNotification();
  },

  handleJavascript : function (aEnable)
  {
    // OpenKioskDebug.print("HANDLE JAVASCRIPT", "ENABLE", aEnable);
    OpenKioskUtils.enableJavascript(aEnable);
    OpenKioskUtils.enableJavascriptInTab(aEnable);
  },

  enableJavascriptInTab : function (aEnable)
  {
    if (OpenKiosk.fullscreenEnabled) return;

    gBrowser.selectedBrowser.jsEnabled = aEnable;
  },

  enableJavascript : function (aEnable)
  {
    // return if OK js enabled is false
    // so we never turn it on regardless of filter setting
    if (!OpenKioskUtils.jsEnabled && !Services.prefs.getBoolPref("javascript.enabled")) return;

    // OpenKioskDebug.print("SET GLOBAL JAVASCRIPT TO", aEnable);
    Services.prefs.setBoolPref("javascript.enabled", aEnable);
  },

  loadFrameScript : function ()
  {
    // ensure content frame pref is cleared
    Services.prefs.clearUserPref("openkiosk.contentframe.observers.added");

    let mm = window.getGroupMessageManager("browsers");

    // use the global message manager instead of one per tab
    // let mm = messageManager;

    // OpenKioskDebug.print("MESSAGE MANAGER", messageManager);

    OpenKioskDebug.print("UTILS ADD CONTENT FRAME SCRIPT");
    mm.loadFrameScript("chrome://browser/content/js/content-frame.js", true);
  }
};

