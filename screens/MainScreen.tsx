import { GOOGLE_WEB_CLIENT_ID, ENDPOINT } from '@env';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { GoogleButton } from '@/components/buttons/GoogleButton';
import { GOOGLE_ADS_ID } from '@/constants/basic-config';
import { EnergyChangePayload, NativeToWebMessageType, WebToNativeMessageType } from '@/native/action-type';
import { useWebviewBridge } from '@/native/native-bridge';
import LoadingScreen from '@/screens/LoadingScreen';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const MainScreen = () => {
  const webviewRef = useRef<WebView | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [needToLogin, setNeedToLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { handleWebviewMessage, sendEventToWeb: _sendEventToWeb } = useWebviewBridge(webviewRef);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<EnergyChangePayload | null>(null);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const insets = useSafeAreaInsets();

  const sendEventToWeb = useCallback(
    (...args: Parameters<typeof _sendEventToWeb>) => _sendEventToWeb(...args),
    [_sendEventToWeb],
  );

  useEffect(() => {
    const handleBackButton = () => {
      sendEventToWeb(NativeToWebMessageType.CAN_BACK_STATE, {
        canGoBack,
      });
      return true;
    };
    if (Platform.OS === 'android') {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
      return () => {
        sub.remove();
      };
    }
  }, [canGoBack, sendEventToWeb]);

  const handleNativeError = (error: any) => {
    sendEventToWeb(NativeToWebMessageType.NATIVE_ERROR, {
      message: error?.message || String(error),
      stack: error?.stack,
    });
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error('idToken is null');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);

      sendEventToWeb(NativeToWebMessageType.GOOGLE_ID_TOKEN, {
        token: idToken,
      });
      setNeedToLogin(false);
    } catch (error) {
      console.error('Failed to login:', error);
      handleNativeError(error);
    }
  };

  const onWebviewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      switch (message.type) {
        case WebToNativeMessageType.NEED_TO_LOGIN:
          setNeedToLogin(true);
          break;
        case WebToNativeMessageType.ENERGY_CHANGE:
          if (message.payload.reason === 'ad') {
            setRewardInfo(message.payload);
            setShowRewardedAd(true);
          }
          break;
        default:
          handleWebviewMessage(event);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!showRewardedAd) return;
    const adUnitId = __DEV__ ? TestIds.REWARDED : GOOGLE_ADS_ID;
    if (!rewardedRef.current) {
      rewardedRef.current = RewardedAd.createForAdRequest(adUnitId);
    }
    const rewarded = rewardedRef.current;
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewarded.show();
    });
    const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      sendEventToWeb(NativeToWebMessageType.ENERGY_CHANGE, { status: 'success', ...rewardInfo });
      setRewardInfo(null);
    });
    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setShowRewardedAd(false);
    });
    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setShowRewardedAd(false);
    });
    rewarded.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [showRewardedAd, sendEventToWeb, rewardInfo]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <LoadingScreen />}
      <WebView
        key="main-screen"
        ref={webviewRef}
        source={{ uri: ENDPOINT }}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onMessage={onWebviewMessage}
        onLoadStart={() => {
          if (isFirstLoad) setIsLoading(true);
        }}
        onLoadEnd={() => {
          if (isFirstLoad) {
            setIsLoading(false);
            setIsFirstLoad(false);
          }
        }}
        onError={() => {
          setIsLoading(false);
        }}
        onHttpError={() => {
          setIsLoading(false);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        webviewDebuggingEnabled={true}
        injectedJavaScript={`
        window.ReactNativeWebView = window.ReactNativeWebView || {};
        true;
      `}
        style={[styles.webview, isLoading && styles.hidden]}
        pointerEvents={needToLogin ? 'none' : 'auto'}
      />

      {needToLogin && (
        <View style={[styles.gsiButtonContainer, { paddingBottom: insets.bottom }]}>
          <GoogleButton onPress={handleGoogleLogin} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
  gsiButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
});

export default MainScreen;
