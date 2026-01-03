#!/bin/sh

mkdir -p installer;

# Main Build
./build.sh;

if [ ! $? -eq 0 ]; then
  echo "ERROR: build failed...";
  exit 1;
fi

# Debian Package 
./debian-package.sh;

# RPM Package 
./rpm-package.sh

if [ ! $? -eq 0 ]; then
  echo "ERROR: build failed...";
  exit 1;
fi

exit 0;
