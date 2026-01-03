#!/bin/bash

if [ ! -f installer/*.tar.bz2 ]; then
  echo "ERROR: installer not found."
  exit 1;
fi

# Build Debian Package

VERSION=$(cat ../../mozilla/browser/config/version.txt)
APP_NAME=OpenKiosk
APP_NAME_LC=openkiosk
ARCH=$(sh get-arch.sh)
OKVERSION=$(grep -Eo '[0-9]{1,4}' ../../mozilla/openkiosk/config/okversion.txt)
LC_APP_NAME=openkiosk
SIZE=$(du -c ../../opt-*/dist/OpenKiosk/ | grep total | sed -e's:total::g'|xargs)

ls installer/*.tar.bz2 | grep arm 2>&1 > /dev/null;

if [ $? -eq 0 ]; then
  ARCH=armhf
fi

cd installer;

rm -rf $APP_NAME *.deb;

mkdir $APP_NAME;

cd $APP_NAME;

mkdir DEBIAN;

cp ../../postinst ../../prerm DEBIAN;

sed -e's:__VERSION__:'$VERSION'.'$OKVERSION':g' -e's:__ARCH__:'$ARCH':g' -e's:__SIZE__:'"$SIZE"':g' ../../control.in > DEBIAN/control;

chmod 755 DEBIAN/postinst DEBIAN/prerm;

mkdir -p usr/bin usr/lib usr/share;

pushd usr/share;

# Desktop IconFile
mkdir -p applications;
cp ../../../../../../mozilla/openkiosk/branding/official/$LC_APP_NAME.desktop applications;

# COPY ICONS
icons=icons/hicolor;
mkdir -p $icons/256x256/apps $icons/128x128/apps $icons/64x64/apps $icons/48x48/apps $icons/32x32/apps;
mkdir -p $icons/24x24/apps $icons/22x22/apps $icons/16x16/apps;

cd $icons;

brandf=../../../../../../../../mozilla/openkiosk/branding/official;

png=$LC_APP_NAME.png
cp $brandf/default256.png 256x256/apps/$png
cp $brandf/default128.png 128x128/apps/$png
cp $brandf/default64.png 64x64/apps/$png
cp $brandf/default48.png 48x48/apps/$png
cp $brandf/default32.png 32x32/apps/$png
cp $brandf/default24.png 24x24/apps/$png
cp $brandf/default22.png 22x22/apps/$png
cp $brandf/default16.png 16x16/apps/$png
popd

cd usr/lib;

tar xfj ../../../$APP_NAME*.tar.bz2;

echo "Architecture:: [$ARCH]";
echo "Version: [$VERSION.$OKVERSION]";
echo "Size: [$SIZE]";

cd ../bin;

ln -s ../lib/$APP_NAME/$APP_NAME .;

cd ../../../;

dpkg-deb --build $APP_NAME;

rm -rf $APP_NAME;

TS=$(ls *.tar.bz2  | cut -f2 -d"/" | sed -e's:'$APP_NAME'::g' -e's:.tar.bz2::g')

mv $APP_NAME.deb $APP_NAME$TS.deb;

echo "Debian Package Completed...";

exit 0;

