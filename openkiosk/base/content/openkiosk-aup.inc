  <!-- AUP -->
  <vbox id="ok-aup" flex="1" hidden="true">
    <browser id="aup-browser" type="content" src="chrome://browser/content/AUP.html" flex="1" />

    <hbox align="right" class="border-top">
      <button id="exit" label="ok.aup.decline.button" oncommand="OpenKioskSession.declineAUP();"/>
      <button label="ok.aup.accept.button" oncommand="OpenKioskSession.acceptAUP();"/>
    </hbox>
  </vbox>
