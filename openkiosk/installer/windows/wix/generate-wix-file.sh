#!/bin/sh

if [ ! "$1" ]; then
  echo "usage: <appfolder>";
fi

wixfile=openkiosk.wxs
dir=$1

echo -n "Generating WiX file [$wixfile]...";

cd $dir;

files=$(find . -maxdepth 1 -type f | sed -e's:./::g');
dirs=$(ls -d */ 2>/dev/null | sed -e's:/::g');

function genId
{
  echo $1 | sed -E -e's:^:_:g' -e's:-|\.|@:_:g';
}

function genDirs
{
  for d in $1
    do
      cd $d;
      dfiles=$(find . -maxdepth 1 -type f | sed -e's:./::g');
      subdirs=$(ls -d */ 2>/dev/null | sed -e's:/::g');
      folders=$folders'<Directory Name="'$d'">\n';
      if [ "$dfiles" ]; then
        genComponentRefs "$dfiles" $d"_";
        fcomponents=$(genFolderComponent "$dfiles" $d"_");
        folders="$folders$fcomponents";
      fi
      if [ "$subdirs" ]; then
        genDirs "$subdirs";
      fi
      folders="$folders</Directory>\n";
      cd ../;
    done
}

function genComponentRefs
{
  for f in $1;
  do
    componentrefs=$componentrefs'<ComponentRef Id="'$(genId "$2$f")'" />\n';
  done
}

function genFolderComponent
{
  for f in $1
  do
    fcomponent=$fcomponent'<Component Id="'$(genId "$2$f")'">\n';
    fcomponent=$fcomponent'<File Name="'$f'" />\n';
    fcomponent=$fcomponent'</Component>\n';
  done

  echo "$fcomponent";
}

function genComponents
{
  for f in $1
  do
    component='<Component Id="'$(genId $f)'">\n';
    component=$component'<File Name="'$f'" />\n';
    component=$component'</Component>\n';
    components=$components$component;
  done
}

genComponentRefs "$files";
genComponents "$files";
genDirs "$dirs";

cd ..;

sed -e's:__COMPONENT_REFS__:'"$componentrefs"':g' -e's:__COMPONENTS__:'"$components"':g' -e's:__FOLDERS__:'"$folders"':g' $wixfile.in > $wixfile;

# Format the xml file
xmllint --format $wixfile > .$wixfile; mv {.,}$wixfile;

echo "Completed.";

exit 0;

