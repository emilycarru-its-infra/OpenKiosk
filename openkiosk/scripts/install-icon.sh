#!/bin/bash

# Installs shortcut to the browser on the desktop

# First, lets figure out where the browser is actually installed
# This cumbersome method handles cases where the script is run
# by clicking, by going to terminal, by using a sym-link to the script
# etc.

if [ "$(uname -n)" == "raspberrypi" ]; then
  echo "Raspberry Pi...";
  exit 0;
fi

SCRIPT_PATH="$0";
WD=`pwd`

if([ -h "${SCRIPT_PATH}" ]) then
   while([ -h "${SCRIPT_PATH}" ]) do SCRIPT_PATH=`readlink "${SCRIPT_PATH}"`; done
fi

pushd . > /dev/null
cd `dirname ${SCRIPT_PATH}` > /dev/null
SCRIPT_PATH=`pwd`
popd > /dev/null

# Now we know where we are installed. Lets create the shortcut.
INSTALLDIR=${SCRIPT_PATH};
DESKTOP=~/Desktop;

if [ ! -d ${DESKTOP} ]; then
  DESKTOP=${HOME}
fi

APP_NAME=OpenKiosk
APP_NAME_LC=$(echo ${APP_NAME} | tr '[:upper:]' '[:lower:]')
SHORTCUT=${APP_NAME_LC}.desktop;
DUSER=$USER;
DISPLAY=:0

if [ "$SUDO_USER" ]; then
  DUSER=$SUDO_USER;
fi

function addTaskbarShortcut
{
  if [ ! -f /usr/share/applications/${SHORTCUT} ]; then
    cp ${DESKTOP}/${SHORTCUT} /usr/share/applications/ > /dev/null 2>&1;

    if [ $? -ne 0 ]; then
      sudo cp ${DESKTOP}/${SHORTCUT} /usr/share/applications/ > /dev/null 2>&1;
    fi
  fi

  sudo -HE -u $DUSER /usr/bin/gsettings get org.gnome.shell favorite-apps | grep -i ${APP_NAME}; 

  if [ $? -ne 0 ]; then
    shortcuts=$(sudo -HE -u $DUSER /usr/bin/gsettings get org.gnome.shell favorite-apps | sed -e's:\[::g' -e's:\]::g');
    shortcuts="['${SHORTCUT}', $shortcuts]";
    sudo -HE -u $DUSER /usr/bin/gsettings set org.gnome.shell favorite-apps "$shortcuts"; 
    sudo -HE -u $DUSER /usr/bin/gsettings get org.gnome.shell favorite-apps | grep -i ${APP_NAME} > /dev/null 2>&1; 

    if [ $? -ne 0 ]; then
      echo "Setting ${APP_NAME} icon failed...";
      echo "Waiting 10 seconds to try again...";
      sleep 10;
      sudo -HE -u $DUSER /usr/bin/gsettings set org.gnome.shell favorite-apps "$shortcuts"; 
      sudo -HE -u $DUSER /usr/bin/gsettings get org.gnome.shell favorite-apps | grep -i ${APP_NAME} > /dev/null 2>&1; 
    fi
  fi

  if [ $? -ne 0 ]; then 
    echo "Failed to set ${APP_NAME} icon to user quick launch taskbar";
    echo "Please manually run this command to add ${APP_NAME} icon to quick launch taskbar:";
    echo;
    echo "    /usr/lib/${APP_NAME}/install-icon.sh";
    echo;
  else
    echo "${APP_NAME} icon has been successfully added to quick launch taskbar for user [$DUSER]...";
  fi


  # Remove Desktop Shortcut File
  rm -f ${DESKTOP}/${SHORTCUT};

  echo "${APP_NAME} icon has been added to quick launch taskbar for user [$DUSER]...";
}

function removeTaskbarShortcut
{
  rm -f /usr/share/applications/${SHORTCUT} > /dev/null 2>&1;

  if [ $? -ne 0 ]; then
    sudo rm -f /usr/share/applications/${SHORTCUT} > /dev/null 2>&1;
  fi

  shortcuts=$(sudo -HE -u $DUSER /usr/bin/gsettings get org.gnome.shell favorite-apps | sed -e"s:'${SHORTCUT}', ::g")
  sudo -HE -u $DUSER /usr/bin/gsettings set org.gnome.shell favorite-apps "$shortcuts"; 

  echo "${APP_NAME} icon has been removed from quick launch taskbar for user [$DUSER]...";
}

if [ "$1" == "-r" ]; then
  removeTaskbarShortcut;
  exit 0;
fi

if [ -d /usr/share/applications ]; then
  addTaskbarShortcut;
else
  echo "Icon for ${APP_NAME} installed on desktop...";
  exit 0;
fi

exit 0;




