
  // OPENKIOSK
  nsCOMPtr<nsIObserverService> os;
  os = do_GetService("@mozilla.org/observer-service;1");
  
  if (os) os->NotifyObservers(nullptr, "openkiosk-window-deactivated", nullptr);
  // OPENKIOSK

