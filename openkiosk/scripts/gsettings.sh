#!/bin/sh

if [ ! "$1" ]; then
  echo "    usage: $0 start|stop";
  exit 0;
fi

if [ "$1" = "start" ]; then
  echo "[GSETTINGS: LOCK]";

  gconftool-2 --type string --set /apps/metacity/global_keybindings/run_command_screenshot "disabled" > /dev/null 2>&1;

  gconftool --set /apps/compiz-1/general/screen0/options/hsize --type=int 1 > /dev/null 2>&1;
  gconftool --set /apps/compiz-1/general/screen0/options/vsize --type=int 1 > /dev/null 2>&1;
  gconftool --set /apps/metacity/window_keybindings/close --type=string '' > /dev/null 2>&1;
  gconftool-2 --set /apps/metacity/window_keybindings/close --type=string '' > /dev/null 2>&1;

  gsettings set org.gnome.shell.extensions.dash-to-dock autohide false > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock dock-fixed false > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock intellihide false > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys magnifier "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys logout "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys screencast "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys screenshot-clip "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys window-screenshot-clip "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys area-screenshot-clip "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys screenreader '' > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys screencast '' > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys terminal '' > /dev/null 2>&1;
  gsettings set org.gnome.desktop.a11y.applications screen-reader-enabled false > /dev/null 2>&1;
  gsettings set overlay-key "" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings minimize "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-down "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-down "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-up "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-up "['']" > /dev/null 2>&1;

  gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-right "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-left "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-1 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-last "['']" > /dev/null 2>&1;

  gsettings set org.gnome.shell.keybindings toggle-message-tray "['']" > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings toggle-overview "['']" > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings toggle-application-view "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings cycle-panels "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings cycle-windows "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings cycle-windows-backward "['']" > /dev/null 2>&1;
  gsettings set com.canonical.Unity2d.Launcher super-key-enable "['']" > /dev/null 2>&1;
  gsettings set org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ launcher-hide-mode 1 > /dev/null 2>&1;
  gsettings set org.gnome.mutter overlay-key "''" > /dev/null 2>&1;
  gsettings set org.gnome.mutter.wayland.keybindings restore-shortcuts "['']" > /dev/null 2>&1;

  gsettings set org.gnome.desktop.wm.preferences mouse-button-modifier "" > /dev/null 2>&1;

  gsettings set org.compiz.core:/org/compiz/profiles/unity/plugins/core/ hsize 1 > /dev/null 2>&1;
  gsettings set org.compiz.core:/org/compiz/profiles/unity/plugins/core/ vsize 1 > /dev/null 2>&1;
  gsettings set org.compiz.expo:/org/compiz/profiles/unity/plugins/expo/ expo-edge "''" > /dev/null 2>&1;
  gsettings set org.compiz.scale:/org/compiz/profiles/unity/plugins/scale/ initiate-edge "''" > /dev/null 2>&1;
  gsettings set org.compiz.core:/org/compiz/profiles/unity/plugins/core/ show-desktop-edge "''" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys screensaver "''" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-applications-backward "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-applications "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-group-backward "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-group "['']" > /dev/null 2>&1;

  gsettings set org.gnome.desktop.screensaver lock-enabled false > /dev/null 2>&1;
  gsettings set org.gnome.desktop.notifications show-in-lock-screen false > /dev/null 2>&1;
  gsettings set org.gnome.desktop.lockdown disable-lock-screen true > /dev/null 2>&1;
  gsettings set org.gnome.desktop.screensaver ubuntu-lock-on-suspend false > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings close "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-input-source "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-input-source-backward "['']" > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.power button-sleep 'blank' > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.power button-suspend 'blank' > /dev/null 2>&1;

  gconftool-2 --set /apps/metacity/window_keybindings/activate_window_menu --type=string '' > /dev/null 2>&1;

  gsettings set org.gnome.desktop.wm.keybindings panel-main-menu  "['']" > /dev/null 2>&1;
  gsettings set org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ panel-first-menu "''" > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings open-application-menu "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings activate-window-menu "['']" > /dev/null 2>&1;

  gsettings set org.gnome.settings-daemon.plugins.media-keys video-out '' > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.media-keys magnifier '' > /dev/null 2>&1;

  gsettings set org.gnome.desktop.wm.keybindings unmaximize "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings show-desktop "['']" > /dev/null 2>&1;

  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-down "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-1 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-2 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-3 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-4 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-5 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-6 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-7 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-8 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-9 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-10 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-11 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-12 "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-left "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-last "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-up "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-right "['']" > /dev/null 2>&1;

  gsettings set org.gnome.desktop.wm.keybindings switch-panels "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings panel-run-dialog "['']" > /dev/null 2>&1;
  # Dupe
  # gsettings set org.gnome.settings-daemon.plugins.media-keys logout '' > /dev/null 2>&1;
  gsettings set org.gnome.settings-daemon.plugins.xrandr active false > /dev/null 2>&1;

  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-1 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-2 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-3 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-4 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-5 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-6 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-7 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-8 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-9 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-10 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-1 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-2 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-3 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-4 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-5 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-6 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-7 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-8 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-9 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-hotkey-10 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock hotkeys-show-dock false  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-1 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-2 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-3 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-4 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-5 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-6 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-7 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-8 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-9 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-10 "['']"  > /dev/null 2>&1;
  gsettings set org.gnome.shell.extensions.dash-to-dock hotkeys-overlay false  > /dev/null 2>&1;

  gsettings set org.gnome.shell.keybindings switch-to-application-1 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-2 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-3 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-4 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-5 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-6 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-7 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-8 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-9 '[]' > /dev/null 2>&1;
  gsettings set org.gnome.shell.keybindings switch-to-application-10 '[]' > /dev/null 2>&1;

  gsettings reset org.gnome.settings-daemon.plugins.media-keys custom-keybindings > /dev/null 2>&1;

  dconf write /org/compiz/profiles/unity/plugins/unityshell/launcher-hide-mode 0 > /dev/null 2>&1;
  dconf write /org/compiz/profiles/unity/plugins/unityshell/edge-responsiveness 0.0 > /dev/null 2>&1;

  gsettings set com.canonical.Unity.Launcher favorites "['']" > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.keybindings switch-windows [''] > /dev/null 2>&1;

  gsettings set org.gnome.mutter dynamic-workspaces false > /dev/null 2>&1;
  gsettings set org.gnome.mutter edge-tiling false > /dev/null 2>&1;
  gsettings set org.gnome.desktop.wm.preferences num-workspaces 1  > /dev/null 2>&1;
  gsettings set org.gnome.desktop.peripherals.touchpad tap-and-drag false > /dev/null 2>&1;
  gsettings set org.gnome.desktop.interface enable-hot-corners false > /dev/null 2>&1;
fi

if [ "$1" = "stop" ]; then
  echo "[GSETTINGS: UNLOCK]";

  gsettings reset org.gnome.shell.extensions.dash-to-dock autohide > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock dock-fixed > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock intellihide > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys magnifier > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys logout > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys terminal > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys screencast > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys screenshot > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys screenshot-clip  > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys window-screenshot  > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys window-screenshot-clip  > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys area-screenshot  > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys area-screenshot-clip  > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys screencast > /dev/null 2>&1;
  gsettings reset org.gnome.mutter overlay-key  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings minimize  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-down  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings move-to-workspace-down  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-up  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings move-to-workspace-up  > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings toggle-message-tray  > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings toggle-overview  > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings toggle-application-view  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings cycle-panels  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings cycle-windows  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings cycle-windows-backward  > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings activate-window-menu  > /dev/null 2>&1;
  gsettings reset com.canonical.Unity2d.Launcher super-key-enable  > /dev/null 2>&1;
  gsettings reset org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ launcher-hide-mode > /dev/null 2>&1;
  gsettings reset org.gnome.mutter overlay-key > /dev/null 2>&1;
  gsettings reset org.gnome.mutter.wayland.keybindings restore-shortcuts > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings panel-main-menu > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.preferences mouse-button-modifier > /dev/null 2>&1;
  gsettings reset org.compiz.core:/org/compiz/profiles/unity/plugins/core/ hsize > /dev/null 2>&1;
  gsettings reset org.compiz.core:/org/compiz/profiles/unity/plugins/core/ vsize > /dev/null 2>&1;
  gsettings reset org.compiz.expo:/org/compiz/profiles/unity/plugins/expo/ expo-edge > /dev/null 2>&1;
  gsettings reset org.compiz.scale:/org/compiz/profiles/unity/plugins/scale/ initiate-edge > /dev/null 2>&1;
  gsettings reset org.compiz.core:/org/compiz/profiles/unity/plugins/core/ show-desktop-edge > /dev/null 2>&1;
  gsettings reset org.compiz.unityshell:/org/compiz/profiles/unity/plugins/unityshell/ panel-first-menu > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys screensaver > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-applications-backward > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-applications > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-group-backward > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-group > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.screensaver lock-enabled > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.notifications show-in-lock-screen > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings open-application-menu > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.lockdown disable-lock-screen > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.screensaver lock-enabled > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.screensaver ubuntu-lock-on-suspend > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings close > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-input-source > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-input-source-backward > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.power button-sleep > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.power button-suspend > /dev/null 2>&1;

  gconftool-2 --type string --set /apps/metacity/global_keybindings/run_command_screenshot "Print" > /dev/null 2>&1;

  gconftool --set /apps/compiz-1/general/screen0/options/hsize --type=int 2 > /dev/null 2>&1;
  gconftool --set /apps/compiz-1/general/screen0/options/vsize --type=int 2 > /dev/null 2>&1;
  gconftool --set /apps/metacity/window_keybindings/close --type=string "<Alt>F4" > /dev/null 2>&1;
  gconftool-2 --set /apps/metacity/window_keybindings/close --type=string "<Alt>F4" > /dev/null 2>&1;
  gconftool-2 --set /apps/metacity/window_keybindings/activate_window_menu --type=string "[<Alt>space]" > /dev/null 2>&1;

  gsettings reset org.gnome.settings-daemon.plugins.media-keys video-out > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys magnifier > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings unmaximize > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings show-desktop > /dev/null 2>&1;

  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-down > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-1 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-2 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-3 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-4 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-5 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-6 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-7 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-8 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-9 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-10 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-11 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-12 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-left > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-last > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-up > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-to-workspace-right > /dev/null 2>&1;

  gsettings reset org.gnome.desktop.wm.keybindings move-to-workspace-right > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings move-to-workspace-left > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings move-to-workspace-1 > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings move-to-workspace-last > /dev/null 2>&1;

  gsettings reset org.gnome.desktop.wm.keybindings switch-panels > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings panel-run-dialog > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys logout > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.media-keys screenreader > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.a11y.applications screen-reader-enabled > /dev/null 2>&1;
  gsettings reset org.gnome.settings-daemon.plugins.xrandr active > /dev/null 2>&1;

  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-1 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-2 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-3 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-4 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-5 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-6 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-7 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-8 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-9 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-ctrl-hotkey-10 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-1 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-2 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-3 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-4 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-5 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-6 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-7 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-8 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-9 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-hotkey-10 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock hotkeys-show-dock > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-1 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-2 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-3 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-4 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-5 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-6 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-7 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-8 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-9 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock app-shift-hotkey-10 > /dev/null 2>&1;
  gsettings reset org.gnome.shell.extensions.dash-to-dock hotkeys-overlay > /dev/null 2>&1;

  gsettings reset org.gnome.shell.keybindings switch-to-application-1 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-2 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-3 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-4 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-5 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-6 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-7 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-8 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-9 '[]' > /dev/null 2>&1;
  gsettings reset org.gnome.shell.keybindings switch-to-application-10 '[]' > /dev/null 2>&1;

  gsettings reset com.canonical.Unity.Launcher favorites > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.keybindings switch-windows

  gsettings reset org.gnome.mutter dynamic-workspaces > /dev/null 2>&1;
  gsettings reset org.gnome.mutter edge-tiling > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.wm.preferences num-workspaces > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.peripherals.touchpad tap-and-drag > /dev/null 2>&1;
  gsettings reset org.gnome.desktop.interface enable-hot-corners > /dev/null 2>&1;
fi

exit 0;

