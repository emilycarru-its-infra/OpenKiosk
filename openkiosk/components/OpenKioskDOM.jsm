/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

// const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

var OpenKioskDOMDebug =
{
  log : function (aMsg)
  {
    Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService).logStringMessage(aMsg);
  },

  print : function ()
  {
    let msg = "OPENKIOSKDOM: "+Array.from(arguments).join(": ");
    OpenKioskDOMDebug.log(msg);
  },

  error : function ()
  {
    let msg = "OPENKIOSKDOM:ERROR: "+Array.from(arguments).join(": ");
    OpenKioskDOMDebug.log(msg);
  }
};

function OpenKiosk () 
{
  OpenKioskDOMDebug.print("CONSTRUCTOR");
}

OpenKiosk.prototype = 
{
     _window : null,
        _uri : null,

  init : function (window) 
  {
    try
    {
      OpenKioskDOMDebug.print("INIT");

      this._window = window;
      this._uri = window.document.documentURIObject;
    }
      catch (e) { OpenKioskDOMDebug.error(e); }
  },

  quit : function ()
  { 
    let o = { window:this._window };

    Services.obs.notifyObservers({ wrappedJSObject:o }, "openkiosk-dom-quit", "");
  },

  settings : function ()
  { 
    let o = { window:this._window };

    Services.obs.notifyObservers({ wrappedJSObject:o }, "openkiosk-dom-settings", "");
  },

  get PDFDownloadEnabled () 
  {
    return Services.prefs.getBoolPref("openkiosk.pdf.downloads.enabled");
  },

  get fullscreenEnabled () 
  {
    return Services.prefs.getBoolPref("openkiosk.fullscreen.enabled");
  },

         classID : Components.ID("{5ef66ec6-8c35-4f37-923d-74bfc7e0a6a3}"),
      contractID : "@mozdevgroup.com/openkioskdom;1",
  QueryInterface : ChromeUtils.generateQI(["nsIDOMGlobalPropertyInitializer"]),
};

var EXPORTED_SYMBOLS = ["OpenKiosk"];

