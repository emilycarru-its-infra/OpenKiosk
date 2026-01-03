
<!-- OPENKIOSK KEYSETS -->
<keyset id="mainKeyset">
  <key keycode="VK_F1" oncommand="OpenKioskAdmin.loginFromKeys();" modifiers="shift" />
  <key keycode="VK_F9" oncommand="OpenKioskAdmin.quitFromKeys();" modifiers="shift" />
  <key keycode="VK_ESCAPE" oncommand="OpenKioskAdmin.hideControls(1);" />
</keyset>

<broadcasterset id="okBroadcasterSet">
  <broadcaster id="OpenKiosk:Tabs" />
</broadcasterset>
