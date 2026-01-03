#!/bin/sh

LANG=C

echo "Setting to: [$@]";

for f in $(find . -name about.dtd); 
do 
  echo "File: [$f]"; 
  sed -i -e "s:<!ENTITY beta.version.*$:<!ENTITY beta.version \"$@\">:g" $f;
done; 

