#!/bin/sh

echo "Unifying ARM and INTEL Builds...";

export date_stamp=$(date +"%Y-%m-%d")
export name=OpenKiosk
export obj_name=openkiosk
export version=$(cat ../../mozilla/browser/config/version.txt)
export dmgname=$name$version-$date_stamp-universal.dmg
export final_dir=universal
export out_dir=out
export moz_folder=mozilla

export dmg_x64=$name-$version.en-US.mac.dmg
export dmg_aarch64=$name-$version.en-US.mac.dmg

export obj_x64=opt-$obj_name-x86_64-apple-darwin
export obj_aarch64=opt-$obj_name-aarch64-apple-darwin

pushd ../../;

if [ ! -d "$obj_x64" ] || [ ! -d "$obj_aarch64" ]; then
  echo "ERROR: Directories [$obj_x64] or [$obj_aarch64] don't exist."
  echo "Did you build both binaries successfully?";
  exit 1;
fi

# Cleanup
rm -rf $out_dir $final_dir $dmgname;

# Unmount if already mounted
hdiutil unmount /Volumes/$name > /dev/null 2>&1;

mkdir -p $out_dir/x64;
mkdir -p $out_dir/aarch64;

# set -x -e

hdiutil mount $obj_x64/dist/$dmg_x64;

cp -r /Volumes/$name/$name.app $out_dir/x64/;

hdiutil unmount /Volumes/$name;

hdiutil mount $obj_aarch64/dist/$dmg_aarch64;

cp -r /Volumes/$name/$name.app $out_dir/aarch64/;

hdiutil unmount /Volumes/$name;

$moz_folder/./mach python $moz_folder/toolkit/mozapps/installer/unify.py $out_dir/x64/*.app $out_dir/aarch64/*.app

mkdir -p $final_dir/$name;

mkdir $final_dir/$name/.background;

cp -RH $out_dir/x64/$name.app $final_dir/$name;

cp -f $moz_folder/openkiosk/branding/official/dsstore $final_dir/$name/.DS_Store;
cp -f $moz_folder/openkiosk/branding/official/disk.icns $final_dir/$name/.VolumeIcon.icns;
cp -f $moz_folder/openkiosk/branding/official/background.png $final_dir/$name/.background;

pushd $final_dir/$name;
ln -s /Applications " ";
popd;

# UDRW
hdiutil create -format UDRW -imagekey bzip-level=9 -ov -volname "$name" -fs HFS+ -srcfolder "$final_dir/$name" $dmgname;
hdiutil mount $dmgname;
SetFile -a C /Volumes/$name;
hdiutil detach /Volumes/$name;

rm -rf $final_dir/$name out;

hdiutil convert $dmgname -format UDBZ -imagekey bzip-level=9 -ov -o $date_stamp.dmg;

rm -f $dmgname;

mv $date_stamp.dmg universal/$dmgname;

popd;

mkdir -p installer;

rm -rf installer/*;

echo "Copying dmg to installer folder...";
cp ../../universal/*.dmg installer;

rm -rf ../../universal;

exit 0;

