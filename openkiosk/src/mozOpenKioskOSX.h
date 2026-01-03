#ifndef __mozOpenKiosk_h
#define __mozOpenKiosk_h

#if defined(__OBJC__)
#import <Cocoa/Cocoa.h>
#import <AppKit/NSSpeechSynthesizer.h>
#import <Foundation/Foundation.h>
#endif

#include "mozIOpenKiosk.h"

#include "nsIDirectoryService.h"
#include "nsISimpleEnumerator.h"
#include "nsString.h"
#include "nsAString.h"
#include "nsCOMPtr.h"
#include "nsLiteralString.h"
#include "nsServiceManagerUtils.h"
#include "nsIPrefService.h"
#include "nsIPrefBranch.h"
#include "nsICryptoHash.h"
#include "nsIObserverService.h"
#include "nsIObserver.h"

class mozOpenKiosk : public nsIObserver,
                     public mozIOpenKiosk
{
  public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIOBSERVER
    NS_DECL_MOZIOPENKIOSK

    static nsresult Create(REFNSIID aIID, void** aResult);

    mozOpenKiosk();

  // DEBUG
  void PrintPointer(const char* aName, nsISupports* aPointer);
  void Log(const char* aMsg);

  private:
    virtual ~mozOpenKiosk();

    nsCOMPtr<nsIPrefBranch> mPrefs;
    nsCOMPtr<nsIObserverService> mOS;

    bool mAdminMode;
};

#endif /* __mozOpenKiosk_h */

