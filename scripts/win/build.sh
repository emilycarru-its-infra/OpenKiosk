#!/bin/bash

name=OpenKiosk

mkdir -p installer;
rm -f installer/*;

pushd ../../mozilla;

# Build 64 Bit
echo "Building $name for 64 Bit Windows...";
echo ". \$topsrcdir/openkiosk/config/mozconfig.win64" > .mozconfig;

if [ "$OK_CLOBBER" ]; then
  ./mach clobber;
fi

./mach build;

if [ $? -ne 0 ]; then
  echo BUILD ERROR...;
  exit 1;
fi

popd;
rm -f ../../opt-openkiosk-x86_64-pc-mingw32/dist/*.msi;
mozmake -s -C ../../opt-openkiosk-x86_64-pc-mingw32/openkiosk/;
mozmake -s -C ../../opt-openkiosk-x86_64-pc-mingw32/openkiosk/ msi;

exit 0;

