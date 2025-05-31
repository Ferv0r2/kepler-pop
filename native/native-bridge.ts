import { RefObject, useCallback } from 'react';
import { BackHandler } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import {
  WebToNativeMessage,
  WebToNativeMessageType,
  NativeToWebMessage,
  NativeToWebMessageType,
  WebAppReadyPayload,
  EnergyChangePayload,
} from './action-type';

type WebviewMessageHandler = (message: WebToNativeMessage) => void;

const createHandlerMap = (
  webviewRef: RefObject<WebView | null>,
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
  [WebToNativeMessageType.NEED_TO_LOGIN]: () => {
    console.log('Need to login');
  },
  [WebToNativeMessageType.ENERGY_CHANGE]: (message) => {
    const payload = message.payload as EnergyChangePayload;
    // Ad, Purchase, Reward -> EnergyChange
    console.log('Energy change:', payload);
  },
});

export const useWebviewBridge = (webviewRef: RefObject<WebView | null>) => {
  const handleWebviewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as WebToNativeMessage;
        const handler = createHandlerMap(webviewRef)[message.type];
        if (!handler) {
          throw new Error(`Unknown action type: ${message.type}`);
        }
        handler(message);
      } catch (e) {
        console.error('Failed to parse webview message', e);
      }
    },
    [webviewRef],
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
