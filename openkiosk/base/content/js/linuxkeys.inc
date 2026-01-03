
  onKeyDown : function ()
  {
    if (OpenKioskAdmin.adminMode) return;

    let e = arguments[0];

    if (e.keyCode == e.DOM_VK_RETURN) OpenKiosk.handleTextEntered(e);

    // OpenKioskDebug.print("KEY DOWN", e.keyCode);

    /*
     * BLOCK KEYS
     */

    switch (e.keyCode)
    {
      case e.DOM_VK_F10:
      case e.DOM_VK_F11:
      case e.DOM_VK_ALT:
        OpenKioskDebug.print("BLOCKED KEY");
        e.preventDefault();
        e.stopImmediatePropagation();
        break;
    }

    if (e.altKey) 
    {
      // OpenKioskDebug.print("ALT");
      switch (e.keyCode)
      {
        case e.DOM_VK_B:
        case e.DOM_VK_E:
        case e.DOM_VK_F:
        case e.DOM_VK_H:
        case e.DOM_VK_S:
        case e.DOM_VK_T:
        case e.DOM_VK_V:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }

    /*
     * BLOCK ALT+SHIFT KEYCOMBOS
     */

    if (e.altKey && e.shiftKey) 
    {
      // OpenKioskDebug.print("CTRL+ALT");
      switch (e.keyCode)
      {
        case e.DOM_VK_E:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }

    if (e.ctrlKey) 
    {
      // OpenKioskDebug.print("CTRL");
      switch (e.keyCode)
      {
        case e.DOM_VK_B:
        case e.DOM_VK_D:
        case e.DOM_VK_H:
        case e.DOM_VK_I:
        case e.DOM_VK_J:
        case e.DOM_VK_N:
        case e.DOM_VK_O:
        case e.DOM_VK_P:
        case e.DOM_VK_Q:
        case e.DOM_VK_S:
        case e.DOM_VK_U:
        case e.DOM_VK_W:
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
     * BLOCK SHIFT KEYCOMBOS
     */

    if (e.shiftKey) 
    {
      // OpenKioskDebug.print("SHIFT");

      switch (e.keyCode)
      {
        case e.DOM_VK_F12:
        case e.DOM_VK_RETURN:
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
    }

    /*
     * BLOCK CMD+ALT KEYCOMBOS
     */

    if (e.metaKey && e.altKey) 
    {
      // OpenKioskDebug.print("META & ALT");
    }

    /*
     * BLOCK CTRL+SHIFT KEYCOMBOS
     */

    if (e.ctrlKey && e.shiftKey) 
    {
      // OpenKioskDebug.print("CTRL & SHIFT");

      switch (e.keyCode)
      {
        case e.DOM_VK_A:
        case e.DOM_VK_C:
        case e.DOM_VK_E:
        case e.DOM_VK_J:
        case e.DOM_VK_M:
        case e.DOM_VK_I:
        case e.DOM_VK_K:
        case e.DOM_VK_P:
        case e.DOM_VK_Q:
        case e.DOM_VK_Y:
        case e.DOM_VK_Z:
        case e.DOM_VK_DELETE:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }

    /*
     * BLOCK CTRL+ALT+SHIFT KEYCOMBOS
     */

    if (e.ctrlKey && e.altKey && e.shiftKey) 
    {
      // OpenKioskDebug.print("CTRL+ALT+SHIFT");

      switch (e.keyCode)
      {
        case e.DOM_VK_I:
          OpenKioskDebug.print("BLOCKED KEY COMBO");
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
      }
    }

    // OpenKioskDebug.displayProperties(e);
  },

