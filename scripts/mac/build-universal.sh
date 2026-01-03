#!/bin/bash

# This BuildID is used for unifying the binaries
# same ID is required for both builds in plist file
export MOZ_BUILD_DATE=`date "+%Y%m%d%H%M%S"`
echo "BUILD_ID: [$MOZ_BUILD_DATE]";

export OK_APP_NAME=openkiosk

if [ ! -d ../../mozilla ]; then
  echo "ERROR: Mozilla repository not found."
  exit 1;
fi

pushd ../../mozilla;

# Build INTEL
echo ". \$topsrcdir/openkiosk/config/mozconfig.mac" > .mozconfig;
if [ "$OK_CLOBBER" ]; then
  ./mach clobber;
fi
./mach build;

if [ $? -ne 0 ]; then
  echo Build Failed...;
  exit 1;
fi

make -s -C ../opt-$OK_APP_NAME-*x86_64-*/openkiosk/; 
make -s -C ../opt-$OK_APP_NAME-*x86_64-*/openkiosk/installer; 

if [ $? -ne 0 ]; then
  echo Build Failed...;
  exit 1;
fi

# ARM
echo ". \$topsrcdir/openkiosk/config/mozconfig.mac.arm" > .mozconfig;
if [ "$OK_CLOBBER" ]; then
  ./mach clobber;
fi
./mach build;

if [ $? -ne 0 ]; then
  echo Build Failed...;
  exit 1;
fi

make -s -C ../opt-$OK_APP_NAME-*x86_64-*/openkiosk/; 
make -s -C ../opt-$OK_APP_NAME-*aarch64-*/openkiosk/installer; 

if [ $? -ne 0 ]; then
  echo Build Failed...;
  exit 1;
fi

echo "ARM and INTEL Builds Completed...";

exit 0;

