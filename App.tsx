import { useWebviewBridge } from './native/native-bridge';
import { NativeToWebMessageType } from './native/action-type';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Svg, Path } from 'react-native-svg';
import { GOOGLE_WEB_CLIENT_ID, ENDPOINT } from '@env';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const GoogleButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.gsiButton} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.gsiButtonState} />
    <View style={styles.gsiButtonContentWrapper}>
      <View style={styles.gsiButtonIcon}>
        <Svg width={20} height={20} viewBox="0 0 48 48">
          <Path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <Path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <Path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <Path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <Path fill="none" d="M0 0h48v48H0z" />
        </Svg>
      </View>
      <Text style={styles.gsiButtonText}>Sign in with Google</Text>
    </View>
  </TouchableOpacity>
);

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

      sendEventToWeb(NativeToWebMessageType.GOOGLE_ID_TOKEN, {
        token: idToken,
      });
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

      {!isLoggedIn && <GoogleButton onPress={handleGoogleLogin} />}
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
  gsiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: '#747775',
    borderWidth: 1,
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 12,
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gsiButtonState: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  gsiButtonContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  gsiButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gsiButtonText: {
    flexGrow: 1,
    color: '#1f1f1f',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.25,
  },
});

export default App;
