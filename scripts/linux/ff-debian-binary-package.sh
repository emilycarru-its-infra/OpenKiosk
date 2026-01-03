#!/bin/bash

# Build Debian Package

ARCH=$(sh get-arch.sh)
TARGET=firefox

cd installer;
rm -rf firefox *.deb;

TARBALL=$(ls firefox*)
FILENAME=$(ls firefox* | sed -e's:.tar.bz2::g')
VERSION=$(echo $FILENAME | cut -d"-" -f2)

tar xfj $TARBALL;
SIZE=$(du -c firefox | grep total | grep -Eo '[0-9]{1,6}')

echo "tarball: $TARBALL";
echo "filename: $FILENAME";

mv firefox _firefox;
mkdir firefox;
cd firefox;

mkdir DEBIAN;

sed -e's:__VERSION__:'$VERSION':g' -e's:__ARCH__:'$ARCH':g' -e's:__SIZE__:'$SIZE':g' ../../ff-control.in > DEBIAN/control;

mkdir -p usr/bin usr/lib usr/share;

cp -r ../../applications usr/share;
cp -r ../../icons usr/share;

cd usr/lib;

mv ../../../_firefox firefox;

echo "Architecture:: [$ARCH]";
echo "Version: [$VERSION]";
echo "Size: [$SIZE]";

cd ../bin;

ln -s ../lib/$TARGET/$TARGET firefox;

cd ../../../;

dpkg-deb --build firefox;

mv firefox.deb  $FILENAME.deb

echo "Debian Package Completed...";

rm -rf firefox;

exit 0;

