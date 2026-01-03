#!/bin/bash

if [ ! -d ../../mozilla ]; then
  echo "ERROR: Mozilla repository not found."
  exit 1;
fi

pushd ../../mozilla;

mkdir -p installer;
rm -rf installer/*;

if [ "$OK_CLOBBER" ]; then
  ./mach clobber;
fi

./mach build;

if [ $? -ne 0 ]; then
  echo BUILD ERROR...;
  exit 1;
fi

# Build Installer
rm -f ../../opt-openkiosk-*/dist/*.tar.bz2;
make -s -C ../opt-*/openkiosk;
make -s -C ../opt-*/openkiosk distro;

echo "Linux Build Complete...";

exit 0;

