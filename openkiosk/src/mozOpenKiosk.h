#include "mozilla/ModuleUtils.h"

#include "nsString.h"
#include "nsStringFwd.h"

#ifdef XP_MACOSX
  #include "mozOpenKioskOSX.h"
#endif

#ifdef XP_WIN
  #include "mozOpenKioskWin.h"
#endif

#ifdef XP_LINUX
  #include "mozOpenKioskLinux.h"
#endif
