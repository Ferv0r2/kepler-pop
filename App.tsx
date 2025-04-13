import { useWebviewBridge } from './native/native-bridge';
import { NativeToWebMessageType } from './native/action-type';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const ENDPOINT = 'https://kepler-pop.wontae.net';

const App = () => {
  const webviewRef = useRef<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const { handleWebviewMessage, sendEventToWeb } = useWebviewBridge(webviewRef);

  useEffect(() => {
    const handleBackButton = () => {
      sendEventToWeb(NativeToWebMessageType.CAN_BACK_STATE, {
        canGoBack,
      });
      return true;
    };
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    }
  }, [canGoBack, sendEventToWeb]);

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
