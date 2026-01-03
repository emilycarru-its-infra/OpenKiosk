#!/bin/sh

# Main Build
./build-universal.sh;

if [ ! $? -eq 0 ]; then
  exit 1;
fi

# Unify into single Universal DMG
./unify.sh;

if [ ! $? -eq 0 ]; then
  exit 1;
fi

exit 0;
