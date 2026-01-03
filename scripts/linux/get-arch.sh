#!/bin/sh

abi=$(ls ../../ | grep opt- | cut -f3 -d"-")
arch=amd64

case $abi in

  aarch64)
    arch=arm64
    ;;

  armv7)
    arch=armhf
    ;;

  x86_64)
    arch=amd64
    ;;

  *)
    arch=amd64
    ;;
esac

echo $arch;

exit 0;

