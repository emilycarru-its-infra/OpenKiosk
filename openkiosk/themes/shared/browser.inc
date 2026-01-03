
#ok-reset-button
{
  list-style-image : url("chrome://openkiosk/skin/reset.png") !important;
}

#ok-context-home
{
  list-style-image : url("chrome://openkiosk/skin/home-black.png") !important;
}

#ok-quit-button
{
  list-style-image : url("chrome://openkiosk/skin/quit.png") !important;
}

#ok-settings-button
{
  list-style-image : url("chrome://openkiosk/skin/settings.png") !important;
}

#window-controls,
#fxa-toolbar-menu-button
{
  visibility: collapse;
}

[fullscreentoolbar=true]
{
  -moz-window-dragging : no-drag;
}

#main-window:not([customizing]) #navigator-toolbox[inFullscreen] > #TabsToolbar:not(:-moz-lwtheme),
#main-window:not(:-moz-any([customizing],[tabsintitlebar])) #navigator-toolbox > #TabsToolbar:not(:-moz-lwtheme) {
  -moz-appearance: none !important;
}

#ok-aup
{
  background: -moz-Dialog;
  padding: 20em;
  font: message-box;
}

#aup-browser
{
  color: -moz-FieldText;
  position: relative;
  border: 1px solid ThreeDShadow;
  border-radius: 10px;
  padding: 3em;
  padding-inline-start: 30px;
  background: -moz-Field;
}

.ok-notification
{
  height     : 35px;
  background : #3274ed;
  color      : white;
  padding    : 0 10px 0 10px;
}

/**
 * browser.xul items that need to be hidden
 */
#pageActionSeparator,
#pageActionButton,
#identity-popup-securityView-footer,
#context_sendTabToDevice_separator,
#context_sendTabToDevice,
#context_pinTab
{
  visibility: collapse;
}

#openkiosk-login[size="large"],
#openkiosk-quit[size="large"],
#openkiosk-error[size="large"],
#openkiosk-warning[size="large"],
#openkiosk-admin[size="large"],
#openkiosk-aup[size="large"]
{
  min-height : 50px;
  font-size  : 16pt;
}

notification[type="aup"]
{
  background: #009933;
}

#openkiosk-login[invalid="true"],
#openkiosk-quit[invalid="true"],
#openkiosk-error
{
  background: #CC0202;
}

#openkiosk-warning
{
  background : #ffe900;
       color : black;
}

#openkiosk-warning-msg
{
}

#openkiosk-aup
{
  background : Window;
       color : black;
}

#openkiosk-warning-seconds
{
   text-align : center;
      padding : auto;
  font-weight : bold;
    min-width : 25px;
    font-size : large;
       border : 1px solid hidden;
      display : block;
}

.ok-icon
{
     display : none;
  background : Window;
      height : 100%;
       width : 25px;
     padding : 2px;
  border-radius: 28px;
}

.debug-black { border : 2px solid black; }
.debug-red { border : 2px solid red; }
.debug-orange { border : 2px solid orange; }
.debug-blue { border : 2px solid blue; }
.debug-yellow { border : 2px solid yellow; }
.debug-pink { border : 2px solid pink; }
.debug-green { border : 2px solid green; }

