import { sendEventToWeb } from 'native/native-bridge';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

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

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: ENDPOINT }}
      onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
    />
  );
};

export default App;
