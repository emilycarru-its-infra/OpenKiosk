#!/bin/bash

if [ ! "$1" ]; then
  echo "Usage: $0 arm|x64";
  exit 1;
fi

OPT=opt-ff-x86_64-pc-linux-gnu
TARGET=firefox

if [ "$1" == "arm" ]; then
  OPT=opt-ff-armv7-unknown-linux-gnueabihf
  TARGET=Firefox
fi

if [ ! -f ../../$OPT/dist/*.tar.bz2 ]; then
  echo "ERROR: installer not found."
  exit 1;
fi

# Build Debian Package

VERSION=$(cat ../../mozilla/browser/config/version.txt)
SIZE=$(du -c ../../$OPT/dist/$TARGET/ | grep total | grep -Eo '[0-9]{1,6}')
ARCH=armhf
FILENAME=$(ls ../../$OPT/dist/*.tar.bz2 | sed -e's:.*/::g' -e's:.tar.bz2::g')

cd installer;

rm -rf firefox*;

cp ../../../$OPT/dist/$FILENAME.tar.bz2 .;

mkdir firefox-esr;

cd firefox-esr;

mkdir DEBIAN;

sed -e's:__VERSION__:'$VERSION':g' -e's:__ARCH__:'$ARCH':g' -e's:__SIZE__:'$SIZE':g' ../../ff-control.in > DEBIAN/control;

mkdir -p usr/bin usr/lib usr/share;

cp -r ../../applications usr/share;
cp -r ../../icons usr/share;

cd usr/lib;

tar xfj ../../../$FILENAME.tar.bz2;

echo "Architecture:: [$ARCH]";
echo "Version: [$VERSION]";
echo "Size: [$SIZE]";

cd ../bin;

ln -s ../lib/$TARGET/$TARGET firefox;

cd ../../../;

dpkg-deb --build firefox-esr;

rm -rf firefox-esr;

mv firefox-esr.deb  $FILENAME.deb

echo "Debian Package Completed...";

exit 0;

