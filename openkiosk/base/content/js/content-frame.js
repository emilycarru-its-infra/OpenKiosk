var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/ExtensionContent.jsm");

const G_FRAME_MANAGER = this;

var global = this;

var ContentDebug =
{
  log : function (aMsg)
  {
    Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService).logStringMessage(aMsg);
  },

  print : function ()
  {
    var msg = "TAB:FRAME: "+Array.from(arguments).join(":");
    ContentDebug.log(msg);
  },

  printProperties : function (aObj)
  {
    let p = this.getProperties(aObj);

    for (let i=0; i<p.length; i++) this.print(p[i]);
  },

  getProperties : function (aObj)
  {
    let p = new Array;

    for (let list in aObj) p.push(list);

    let rv = p.sort();

    return rv;
  },

  error : function ()
  {
    ContentDebug.log("TAB:FRAME:ERROR: "+Array.from(arguments).join(":"));
  }
};

/******
addMessageListener("OpenKiosk:PrintListener", function (aMsg)
{
  ContentDebug.print("OpenKiosk:PrintListener", content.location);

  try
  {
    let pSS = Cc["@mozilla.org/gfx/printsettings-service;1"].getService(Ci.nsIPrintSettingsService);
    let printSettings = pSS.globalPrintSettings;
    let printerName = aMsg.data.printerName;
    let contentWindow = Services.wm.getOuterWindowWithId(aMsg.data.windowID);

    ContentDebug.print("PRINT SETTINGS", printSettings);

    printSettings.printerName = printerName;

    pSS.initPrintSettingsFromPrinter(printSettings.printerName, printSettings);

    pSS.initPrintSettingsFromPrefs(printSettings, true, printSettings.kInitSaveAll);

    // No feedback to user
    printSettings.printSilent   = true;
    printSettings.showPrintProgress = false;

    // Other settings
    printSettings.printBGImages = true;
    printSettings.shrinkToFit = true;

    // Frame settings
    printSettings.howToEnableFrameUI = printSettings.kFrameEnableAll;
    printSettings.printFrameType = printSettings.kFramesAsIs;

    let printProgressListener =
    {
         onStateChange : function (webProgress, request, stateFlags, status) {},
      onProgressChange : function () {},
      onLocationChange : function () {},
        onStatusChange : function () {},
      onSecurityChange : function () {}
    };

    try
    {
      let webBrowserPrint = contentWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebBrowserPrint);

      ContentDebug.print("PRINTING ON", printerName, "SILENT", printSettings.printSilent);
      webBrowserPrint.print(printSettings, printProgressListener);
      // webBrowserPrint.print(printSettings, null);
    }
      catch (e) { ContentDebug.error(e); }
  }
    catch (e) { ContentDebug.error(e); }
});
******/

addMessageListener("OpenKiosk:GetSelection", function (aMsg)
{
  // ContentDebug.print("OpenKiosk:GetSelection", content.location);

  let sel = content.getSelection();
  if (sel && sel.toString().length) 
  {
    ContentDebug.print("INVALIDATE SELECTION", sel.toString());
    try { sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-invalidate-selection" }); }
    catch (e) {}
  }
});

var OpenKioskFrame =
{
  // OPENKIOSKDOM OBSERVER
  OpenKioskDOM :
  {
    _window : null,

    observe : function (subject, topic, data)
    {
      /**
       * QUIT
       */
      if (topic == "openkiosk-dom-quit")
      {
        // ContentDebug.print("QUIT");
        try { sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-dom-quit" }); }
        catch (e) {}
      }

      /**
       * SETTINGS
       */
      if (topic == "openkiosk-dom-settings")
      {
        // ContentDebug.print("SETTINGS");
        try { sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-dom-settings" }); }
        catch (e) {}
      }
    }
  }
};

  // ContentDebug.print("CONTENT FRAME OBSERVERS ADDED");

  Services.obs.addObserver(OpenKioskFrame.OpenKioskDOM, "openkiosk-dom-quit", false);
  Services.obs.addObserver(OpenKioskFrame.OpenKioskDOM, "openkiosk-dom-settings", false);

  sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-contentframe-observers-added" });

  let obj =
  {
    handleEvent (event) 
    {
      try
      {
        // ContentDebug.print("HANDLE EVENT", event.target.nodeName.toLowerCase(), event.shiftKey);

        let isLink = (event.target.nodeName.toLowerCase() == "a");

        if (!isLink) return;

        // ContentDebug.print("IS LINK", isLink);

        if (event.shiftKey) 
        {
          event.preventDefault();
          event.stopImmediatePropagation();
          event.stopPropagation();
          ContentDebug.print("CLICK SHIFT BLOCKED");
          return;
        }

        let browser_link_open_newwindow = (Services.prefs.getIntPref("browser.link.open_newwindow") == 1);
        let fullscreenEnabled = Services.prefs.getBoolPref("openkiosk.fullscreen.enabled");

        // ContentDebug.print("browser_link_open_newwindow", browser_link_open_newwindow);
        // ContentDebug.print("fullscreenEnabled", fullscreenEnabled);

        if (fullscreenEnabled && browser_link_open_newwindow)
        {
          ContentDebug.print("REMOVE LINK TARGET");
          event.target.removeAttribute("target");
        }
      }
        catch (e) { ContentDebug.error(e); }
    }
  };

Cc["@mozilla.org/eventlistenerservice;1"].getService(Ci.nsIEventListenerService).addSystemEventListener(global, "mousedown", obj, true);

function contentUnloaded (aEvent)
{
  if (aEvent.target == G_FRAME_MANAGER) 
  {
    // ContentDebug.print("TAB CONTENT UNLOADED", "REMOVE OBSERVERS");
    Services.obs.removeObserver(OpenKioskFrame.OpenKioskDOM, "openkiosk-dom-quit");
    Services.obs.removeObserver(OpenKioskFrame.OpenKioskDOM, "openkiosk-dom-settings");
  }
}

function handleClick (aEvent)
{
  let target = aEvent.target;

  // ContentDebug.print("HANDLE CLICK", target.ownerDocument.contentType, target.id);

  if (target.ownerDocument.contentType == "application/pdf") 
  {
    if (target.id == "home")
    {
      try { sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-go-home" }); }
      catch (e) {}
    }
  }
}

var osk =
{
  addMessageListener : function ()
  {
    // ContentDebug.print("ADD OSK MESSAGE LISTENER");
  
    try
    {
      function cb (aMsg)
      {
        ContentDebug.print("CALLBACK", "KEY", aMsg.data.key);
  
        let key = aMsg.data.key;
        let focusedElement = Services.focus.focusedElement || content.document.activeElement; 
  
        ContentDebug.print("Services.focus.focusedElement", Services.focus.focusedElement);
        ContentDebug.print("content.document.activeElement", content.document.activeElement);
        ContentDebug.print("getFocusedElementForWindow", Services.focus.getFocusedElementForWindow(content, true, {}));
        // ContentDebug.print("EDITOR", focusedElement.editor);

        let activeElement = content.document.activeElement;
        ContentDebug.print("activeElement TAG", activeElement.nodeName.toLowerCase());
        if (activeElement.nodeName.toLowerCase() == "iframe") 
        {
          try
          {
            let activeWindow = activeElement.contentWindow;
            ContentDebug.print("IFRAME DETECTED", activeElement.contentWindow);
          }
            catch (e) 
          { 
            ContentDebug.error(e); 
            ContentDebug.print("CAN'T ACCESS IFRAME");
            ContentDebug.print("SEND MESSAGE");
            const keyevent = new KeyboardEvent("keydown", { key:key });
            ContentDebug.print("CONTENT DISPATCH EVENT", activeElement);
            activeElement.dispatchEvent(keyevent);
            return; 
          }
        }

        let editor = focusedElement.editor;
  
        if (!focusedElement || !editor) return;

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
            ContentDebug.print("FOCUSED ELEMENT TAG", focusedElement.nodeName.toLowerCase());
            if (focusedElement.nodeName.toLowerCase() == "textarea") editor.insertLineBreak();
              else 
            {
              ContentDebug.print("CONTENT", content.location);
              ContentDebug.print("DISPATCH RETURN EVENT");

              let doc = focusedElement.ownerDocument;
              let win = doc.defaultView || doc.parentWindow;

              ContentDebug.print("WINDOW", win.location, win == content);

              ContentDebug.print("FORM", focusedElement.form);

              focusedElement.form.submit();
            }
            break;
    
          case "space_bar":
            editor.insertText(" ");
            break;
    
          default:
            editor.insertText(key);
        }
      }
      addMessageListener("OpenKiosk:InsertOSKKey", cb);
    }
      catch (e) { ContentDebug.error(e); }
  
      // removeMessageListener("OpenKiosk:InsertOSKKey", cb);
  },
  
  showOSK : function ()
  {
    // ContentDebug.print("SHOW OSK");
    sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-show-osk" }); 
  },
  
  hideOSK : function ()
  {
    // ContentDebug.print("HIDE OSK");
    sendAsyncMessage("OpenKiosk:FrameMessageListener", { command: "openkiosk-hide-osk" }); 
  },
  
  isValidOSKInput : function (aEl)
  {
    try
    {
      // ContentDebug.print("IS VALID OSK INPUT", aEl);
  
      let rv = false;
      let tag = aEl.nodeName.toLowerCase();
  
      // ContentDebug.print("TAG", tag);
  
      if (tag == "textarea" || tag == "html:textarea") rv = true;
      else if (tag == "search-textbox") rv = true;
      else if (tag == "input" || tag == "html:input")
      {
        ContentDebug.print("INPUT TYPE", aEl.type);
        switch (aEl.type)
        {
          case "text":
          case "password":
          case "email":
          case "search":
          case "number":
          case "url":
          case "tel":
          case "month":
            rv = true;
            break;
        }
      }
        // ContentDebug.print("IS VALID OSK INPUT", rv);
        return rv;
    }
      catch (e) { ContentDebug.error(e); }
  },

  timer : null,

  setTimeout : function (cb, time, type)
  {
    if (!this.timer) this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

    this.timer.initWithCallback(cb, time, type);
  },

  scrollIntoView : function ()
  {
    let focusedElement = Services.focus.focusedElement;
    ContentDebug.print("SCROLL INTO VIEW", focusedElement, focusedElement.nodeName);
    focusedElement?.scrollIntoView({behavior:"smooth", block:"start"});
  },
  
  handleDOMContent : function (aEvent)
  {
    if (!Services.prefs.getBoolPref("openkiosk.osk.enabled")) return;

    ContentDebug.print("HANDLE DOM CONTENT");

    let focusedElement = aEvent.target || Services.focus.getFocusedElementForWindow(content, true, {});
    let tag = aEvent.target.nodeName.toLowerCase();
  
    // ContentDebug.print("HANDLE DOM CONTENT", focusedElement, "TAG", tag);
  
    if (!focusedElement || !osk.isValidOSKInput(aEvent.target)) 
    {
      osk.hideOSK();
      return;
    }
  
    ContentDebug.print("handleDOMContent", focusedElement, "TAG", tag);
  
    osk.showOSK();

    osk.setTimeout(osk.scrollIntoView, 100, Ci.nsITimer.TYPE_ONE_SHOT);
  },

  handlePageSelection : function ()
  {
    if (Services.prefs.getBoolPref("openkiosk.content.selection.enabled")) return;

    try
    {
      // ContentDebug.print("HANDLE PAGE SELECTION", content.location, content);

      let ss = content.document.styleSheets;

      // ContentDebug.print("STYLE SHEETS", ss, "LENGTH", ss.length);

      if (!ss.length) 
      {
        // ContentDebug.print("STYLE SHEETS", "RETRY");
        content.setTimeout(osk.handlePageSelection, 500);
        return;
      }

      // ContentDebug.print("INSERT RULE");
      ss[0].insertRule("* { user-select:none !important }"); 
    }
      catch (e) { /*ContentDebug.error("handlePageSelection", e);*/ }
  },
  
  handleOSK : function ()
  {
    if (Services.prefs.getBoolPref("openkiosk.osk.enabled")) return;

    let focusedElement = Services.focus.focusedElement || content.document.activeElement;
  
    if (!focusedElement || !osk.isValidOSKInput(focusedElement)) 
    {
      osk.hideOSK();
      return;
    }
  
    osk.showOSK();
  },

  handleDOMContentLoad : function ()
  {
    ContentDebug.print("HANDLE DOM CONTENT LOAD");
    osk.handleOSK();
    osk.handlePageSelection();
  }
};

addEventListener("unload", contentUnloaded, false);
addEventListener("click", handleClick, false);
addEventListener("DOMContentLoaded", osk.handleDOMContentLoad, false);
addEventListener("mousedown", osk.handleDOMContent, false);
  
osk.addMessageListener();
osk.handleDOMContentLoad();
  
// ContentDebug.print("CONTENT FRAME LOADED");
  
