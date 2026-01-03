#!/bin/bash

if [ ! -f installer/*.deb ]; then
  echo "ERROR: .deb installer not found."
  exit 1;
fi

# Build RPM Package

APP_NAME=OpenKiosk
APP_NAME_LC=openkiosk

ABI=$(ls ../../ | grep opt- | cut -f3 -d"-")

if [ "$ABI" != "x86_64" ]; then
  exit 0;
fi

cd installer;

rm -rf *.rpm $APP_NAME_LC*;

echo "Convert Debian Package to RPM...";

alien -r -g -v -c $APP_NAME*.deb;

sed -i -e's#%dir "/"#__DELETE__#' -e's#%dir "/usr/bin/"#__DELETE__#' -e's#%dir "/usr/"#__DELETE__#' -e's#%dir "/usr/lib/"#__DELETE__#' -e/__DELETE__/d $APP_NAME_LC*/$APP_NAME_LC*.spec

cd $APP_NAME_LC*/;

rpmbuild --target=$ABI --buildroot $(pwd) -bb $APP_NAME_LC-*.spec

echo "RPM Package Completed...";

cd ../;

# rename package
RPM_NAME=$(ls $APP_NAME*.deb | sed -e's:\.deb::g')
mv $APP_NAME_LC*.rpm $RPM_NAME.rpm;

exit 0;

