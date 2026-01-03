#ifndef __mozOpenKiosk_h
#define __mozOpenKiosk_h


#include "mozIOpenKiosk.h"
#include "nsCOMPtr.h"
#include "nsServiceManagerUtils.h"
#include "nsIPrefService.h"
#include "nsIPrefBranch.h"

class mozOpenKiosk : public mozIOpenKiosk
{
  public:
    NS_DECL_ISUPPORTS
    NS_DECL_MOZIOPENKIOSK

    static nsresult Create(REFNSIID aIID, void** aResult);

    mozOpenKiosk();

    // DEBUG
    void Log(const char* aMsg);

  private:
    virtual ~mozOpenKiosk();
    void HandleExplorer(bool aDisable);
    nsCOMPtr<nsIPrefBranch> mPrefs;

};

#endif /* __mozOpenKiosk_h */

