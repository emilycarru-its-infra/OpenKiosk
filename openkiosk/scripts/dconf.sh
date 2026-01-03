#!/bin/sh

of=~/.securebrowwser.deconf.grid;

if [ ! "$1" ]; then
  echo;
  echo "  usage: $0 <write|reset|read>";
  echo;
fi

which dconf;

if [ $? > 0 ]; then
  exit 1;
fi

if [ "$1" = "write" ] && [ ! -f $of ]; then
  orig="$(dconf read /org/compiz/profiles/unity/plugins/core/active-plugins | sed -e's:\[::g' -e's:\]::g')";

  if [ -n "${orig}" ]; then
    # remove 'grid' 'scale' and 'unityshell'
    val=`echo "[${orig}]" | sed -e"s:, 'grid'::g" -e"s:, 'scale'::g" -e"s:, 'unityshell'::g"`;

    echo "[${orig}]" > $of;

    dconf write /org/compiz/profiles/unity/plugins/core/active-plugins "${val}" > /dev/null 2>&1;

    if [ $? -eq 0 ]; then
      echo DCONF WRITE SUCCESS...;
    fi
  fi
fi

if [ "$1" = "reset" ] && [ -f $of ]; then
  val="$(cat $of)";

  # echo "${val}";

  dconf write /org/compiz/profiles/unity/plugins/core/active-plugins "${val}" > /dev/null 2>&1;

  # echo $?;

  if [ $? -eq 0 ]; then
    echo DCONF RESET SUCCESS...;
    rm -f $of;
  fi
fi

if [ "$1" = "read" ]; then
  dconf read /org/compiz/profiles/unity/plugins/core/active-plugins
fi

exit 0;

