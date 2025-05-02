import { useWebviewBridge } from './native/native-bridge';
import { NativeToWebMessageType } from './native/action-type';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const ENDPOINT = 'https://kepler-pop.wontae.net';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
  offlineAccess: false,
});

const App = () => {
  const webviewRef = useRef<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();

      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error('idToken is null');

      webviewRef.current?.postMessage(
        JSON.stringify({
          type: 'GOOGLE_ID_TOKEN',
          payload: idToken,
        }),
      );
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  return (
    <View style={styles.container}>
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
        style={styles.webview}
      />

      {!isLoggedIn && (
        <TouchableOpacity style={styles.loginButton} onPress={handleGoogleLogin}>
          <Text style={styles.loginText}>Google로 로그인</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loginButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
