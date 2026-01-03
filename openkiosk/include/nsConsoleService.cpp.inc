  if (PR_GetEnv("OPENKIOSK_JAVASCRIPT_ERROR"))
  {
    nsAutoString msg;
    aMessage->GetMessageMoz(msg);

    uint32_t logLevel = 0;
    aMessage->GetLogLevel(&logLevel);
    
    switch (logLevel)
    {
      case nsIConsoleMessage::debug:
      case nsIConsoleMessage::info:
      case nsIConsoleMessage::error:
        printf("%s\n", NS_ConvertUTF16toUTF8(msg).get());
        break;
    }
  }
