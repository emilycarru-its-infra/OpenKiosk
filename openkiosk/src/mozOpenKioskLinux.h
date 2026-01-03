#ifndef __mozOpenKiosk_h
#define __mozOpenKiosk_h

#include "nsIDirectoryService.h"
#include "mozIOpenKiosk.h"
#include "nsIObserverService.h"
#include "nsIObserver.h"
#include "nsCOMPtr.h"
#include "nsServiceManagerUtils.h"


class mozOpenKiosk : public mozIOpenKiosk,
                     public nsIObserver
{
  public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIOBSERVER
    NS_DECL_MOZIOPENKIOSK

    static nsresult Create(REFNSIID aIID, void** aResult);

    mozOpenKiosk();

    void Enable();
    void Disable();

    // DEBUG
    void PrintPointer(const char* aName, nsISupports* aPointer);
    void Log(const char* aMsg);

  private:
    virtual ~mozOpenKiosk();

    nsCOMPtr<nsIObserverService> mOS;
};

#endif /* __mozOpenKiosk_h */

