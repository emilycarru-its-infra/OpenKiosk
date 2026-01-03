  onKeyDown : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    // OpenKioskDebug.print("KEY DOWN");

    let e = arguments[0];

    if (e.keyCode == e.DOM_VK_RETURN) OpenKiosk.handleTextEntered(e);

    /*
     * BLOCK KEYS
     */

    // OpenKioskDebug.print("KEY DOWN", e.keyCode, e.target);

    switch (e.keyCode)
    {
      case e.DOM_VK_F5:
      case e.DOM_VK_F11:
      case e.DOM_VK_F12:
        OpenKioskDebug.print("BLOCKED KEY");
        e.preventDefault();
        e.stopImmediatePropagation();
        break;
    }

    if (e.altKey) OpenKioskDebug.print("ALT");

    if (e.ctrlKey) OpenKioskDebug.print("CTRL");

    /*
     * BLOCK SHIFT KEYCOMBOS
     */

    if (e.shiftKey) 
    {
      // OpenKioskDebug.print("SHIFT");

      switch (e.keyCode)
      {
        case e.DOM_VK_RETURN:
        case e.DOM_VK_F5:
        case e.DOM_VK_F7:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }

    /*
     * BLOCK CMD KEYCOMBOS
     */

    if (e.metaKey) 
    {
      // OpenKioskDebug.print("META");

      switch (e.keyCode)
      {
        case e.DOM_VK_B:
        case e.DOM_VK_D:
        case e.DOM_VK_I:
        case e.DOM_VK_J:
        case e.DOM_VK_O:
        case e.DOM_VK_P:
        case e.DOM_VK_N:
        case e.DOM_VK_Q:
        case e.DOM_VK_S:
        case e.DOM_VK_U:
        case e.DOM_VK_W:
        case e.DOM_VK_Y:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;

        case e.DOM_VK_T:
          if (!Services.prefs.getBoolPref("openkiosk.tabs.enabled"))
          {
            OpenKioskDebug.print("BLOCKED KEY COMBO");
            e.preventDefault();
            e.stopImmediatePropagation();
          }
          break;
      }
    }

    /*
     * BLOCK CMD+ALT KEYCOMBOS
     */

    if (e.metaKey && e.altKey) 
    {
      // OpenKioskDebug.print("META & ALT");

      switch (e.keyCode)
      {
        case e.DOM_VK_C:
        case e.DOM_VK_E:
        case e.DOM_VK_I:
        case e.DOM_VK_K:
        case e.DOM_VK_M:
        case e.DOM_VK_P:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }

    /*
     * BLOCK CMD+SHIFT KEYCOMBOS
     */

    if (e.metaKey && e.shiftKey) 
    {
      // OpenKioskDebug.print("META & SHIFT");

      switch (e.keyCode)
      {
        case e.DOM_VK_A:
        case e.DOM_VK_C:
        case e.DOM_VK_F:
        case e.DOM_VK_H:
        case e.DOM_VK_J:
        case e.DOM_VK_O:
        case e.DOM_VK_P:
        case e.DOM_VK_S:
        case e.DOM_VK_W:
        case e.DOM_VK_DELETE:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }
    // OpenKioskDebug.displayProperties(e);
  },

