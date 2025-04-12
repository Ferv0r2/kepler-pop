import { handlerMap, MessageData, sendEventToWeb } from './native/native-bridge';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

const ENDPOINT = 'https://kepler-pop.wontae.net';

const App = () => {
  const webviewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      sendEventToWeb(webviewRef, 'NAVIGATE_STATE', {
        canGoBack,
      });
    }
  }, [canGoBack]);

  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    try {
      const data: MessageData = JSON.parse(event.nativeEvent.data);
      const handler = handlerMap[data.type];
      if (!handler) {
        throw new Error(`Unknown action type: ${data.type}`);
      }
      handler(data);
    } catch (e) {
      console.error('Failed to parse webview message', e);
    }
  };

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: ENDPOINT }}
      onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
      onMessage={handleWebviewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      injectedJavaScript={`
        window.ReactNativeWebView = window.ReactNativeWebView || {};
        true;
      `}
    />
  );
};

export default App;
