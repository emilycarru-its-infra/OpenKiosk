#include "mozilla/ModuleUtils.h"

#ifdef XP_MACOSX
  #include "mozOpenKioskOSX.h"
#endif

#ifdef XP_WIN
#include "mozOpenKioskWin.h"
#endif

#ifdef XP_UNIX
#include "mozOpenKioskLinux.h"
#endif

using namespace mozilla;

NS_GENERIC_FACTORY_CONSTRUCTOR(mozOpenKiosk)

// {498549E2-F954-46C3-B980-9A95F74267FB}
#define MOZ_OPENKIOSK_CID \
{ 0x498549E2, 0xF954, 0x46C3, { 0xB9, 0x80, 0x9A, 0x95, 0xF7, 0x42, 0x67, 0xFB } }

NS_DEFINE_NAMED_CID(MOZ_OPENKIOSK_CID);

static const mozilla::Module::CIDEntry kOpenKioskCIDs[] = {
    { &kMOZ_OPENKIOSK_CID, false, nullptr, mozOpenKioskConstructor },
    { nullptr }
};

static const mozilla::Module::ContractIDEntry kOpenKioskContracts[] = {
    { MOZ_OPENKIOSK_CONTRACT_ID, &kMOZ_OPENKIOSK_CID },
    { nullptr }
};

extern const mozilla::Module kOpenKioskModule = {
    mozilla::Module::kVersion,
    kOpenKioskCIDs,
    kOpenKioskContracts
};
