import { RefObject, useCallback } from 'react';
import { BackHandler } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import {
  WebToNativeMessage,
  WebToNativeMessageType,
  NativeToWebMessage,
  NativeToWebMessageType,
  WebAppReadyPayload,
  UpdateEnergyPayload,
  ShowAdPayload,
  MakePurchasePayload,
} from './action-type';

type WebviewMessageHandler = (message: WebToNativeMessage) => void;

const createHandlerMap = (
  webviewRef: RefObject<WebView | null>,
  setIsLoggedIn?: (v: boolean) => void,
): Record<WebToNativeMessageType, WebviewMessageHandler> => ({
  [WebToNativeMessageType.WEB_APP_READY]: (message) => {
    console.log('Web app ready:', (message.payload as WebAppReadyPayload).timestamp);
  },
  [WebToNativeMessageType.BACK_ACTION]: () => {
    webviewRef?.current?.goBack();
  },
  [WebToNativeMessageType.EXIT_ACTION]: () => {
    BackHandler.exitApp();
  },
  [WebToNativeMessageType.UPDATE_ENERGY]: (message) => {
    const payload = message.payload as UpdateEnergyPayload;
    console.log('Energy updated:', payload.change, 'New value:', payload.newValue);
  },
  [WebToNativeMessageType.SHOW_AD]: (message) => {
    const payload = message.payload as ShowAdPayload;
    console.log('Show ad requested:', payload.reason);
  },
  [WebToNativeMessageType.MAKE_PURCHASE]: (message) => {
    const payload = message.payload as MakePurchasePayload;
    console.log('Purchase requested:', payload.productId, 'Quantity:', payload.quantity);
  },
  [WebToNativeMessageType.GET_USER_INFO]: () => {
    console.log('User info requested');
  },
  [WebToNativeMessageType.LOGIN_SUCCESS]: (message) => {
    if (setIsLoggedIn && message.payload && (message.payload as import('./action-type').LoginSuccessPayload).success) {
      setIsLoggedIn(true);
    }
  },
});

export const useWebviewBridge = (webviewRef: RefObject<WebView | null>, setIsLoggedIn?: (v: boolean) => void) => {
  const handleWebviewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as WebToNativeMessage;
        const handler = createHandlerMap(webviewRef, setIsLoggedIn)[message.type];
        if (!handler) {
          throw new Error(`Unknown action type: ${message.type}`);
        }
        handler(message);
      } catch (e) {
        console.error('Failed to parse webview message', e);
      }
    },
    [webviewRef, setIsLoggedIn],
  );

  const sendEventToWeb = useCallback(
    <T extends NativeToWebMessageType>(type: T, payload?: unknown) => {
      if (!webviewRef.current) return;

      const message: NativeToWebMessage = { type, payload };
      webviewRef.current.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', { data: '${JSON.stringify(message)}' }));
        true;
      `);
    },
    [webviewRef],
  );

  return {
    handleWebviewMessage,
    sendEventToWeb,
  };
};
