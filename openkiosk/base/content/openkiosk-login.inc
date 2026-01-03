  <!-- LOGIN -->
  <hbox id="openkiosk-login" class="ok-notification" align="center" hidden="true">
    <image src="chrome://global/skin/icons/info.svg" class="ok-icon" />
    <label value="&ok.admin.password.tb;" />
    <html:input id="openkiosk-password" type="password" value="" 
                onkeyup="if (event.keyCode == 13) OpenKioskAdmin.loginWithPassword();" 
                onkeypress="OpenKioskAdmin.resetPasswordLogin();" />
    <label id="invalid-password" value="" />
    <spacer flex="1"/>
    <button label="&ok.admin.cancel.button;" oncommand="OpenKioskAdmin.hideControls();" />
    <button label="&ok.admin.ok.button;" oncommand="OpenKioskAdmin.loginWithPassword();" />
  </hbox>

  <!-- QUIT -->
  <hbox id="openkiosk-quit" class="ok-notification" align="center" hidden="true">
    <image src="chrome://global/skin/icons/info.svg" class="ok-icon" />
    <label value="&ok.admin.quit.password.tb;" />
    <html:input id="openkiosk-quit-password" type="password" value="" 
                onkeyup="if (event.keyCode == 13) OpenKioskAdmin.quitWithPassword();" 
                onkeypress="OpenKioskAdmin.resetPasswordLogin();" />
    <label id="invalid-quit-password" value="" />
    <spacer flex="1"/>
    <button label="&ok.admin.cancel.button;" oncommand="OpenKioskAdmin.hideControls();" />
    <button label="&ok.admin.ok.button;" oncommand="OpenKioskAdmin.quitWithPassword();" />
  </hbox>

  <!-- ERROR -->
  <hbox id="openkiosk-error" class="ok-notification" align="center" hidden="true">
    <image src="chrome://global/skin/icons/error.svg" class="ok-icon" />
    <label id="openkiosk-error-msg" value="" />
  </hbox>

  <!-- SESSION COUNTDOWN -->
  <hbox id="openkiosk-warning" class="ok-notification" align="center" hidden="true">
    <image src="chrome://global/skin/icons/warning.svg" class="ok-icon" />
    <label id="openkiosk-warning-msg" value="" />
    <label id="openkiosk-warning-seconds" value="" />
    <label id="openkiosk-warning-end" value="" />
    <spacer flex="1"/>
    <button data-l10n-id="ok-session-continue-button" oncommand="OpenKioskSession.continue();" />
  </hbox>

  <!-- ADMIN -->
  <hbox id="openkiosk-admin" class="ok-notification" align="center" hidden="true">
    <image src="chrome://global/skin/icons/info.svg" class="ok-icon" />
    <label id="openkiosk-admin-msg" data-l10n-id="ok-admin-settings-label" />
    <spacer flex="1"/>
    <button label="&ok.exit.button;" oncommand="OpenKioskAdmin.exit();" />
    <button label="&ok.quit.label;" oncommand="OpenKioskAdmin.quit();" />
  </hbox>

  <!-- AUP -->
  <hbox id="openkiosk-aup" class="ok-notification" align="center" hidden="true">
    <image src="chrome://global/skin/icons/info.svg" class="ok-icon" />
    <label id="openkiosk-aup-msg" value="&ok.aup.title;" />
    <spacer flex="1"/>
    <button label="&ok.aup.decline.button;" oncommand="OpenKioskSession.declineAUP();" />
    <button label="&ok.aup.accept.button;" oncommand="OpenKioskSession.acceptAUP();" />
  </hbox>

