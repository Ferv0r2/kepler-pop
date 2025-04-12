import { RefObject } from 'react';
import { BackHandler } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { ReceiveFromWebviewActionType } from './action-type';

type WebviewMessageHandler = (data: any) => void;

interface MessageData {
  type: ReceiveFromWebviewActionType;
  [key: string]: any;
}

const handlerMap: Record<ReceiveFromWebviewActionType, WebviewMessageHandler> = {
  BACK_ACTION: () => {
    webviewRef?.current?.goBack();
  },
  EXIT_ACTION: () => {
    BackHandler.exitApp();
  },
};

let webviewRef: RefObject<WebView> | null = null;

export const handleWebviewMessage = (event: WebViewMessageEvent, _webviewRef: RefObject<WebView>) => {
  webviewRef = _webviewRef;
  try {
    const data: MessageData = JSON.parse(event.nativeEvent.data);
    const handler = handlerMap[data.type];
    if (handler) {
      handler(data);
    } else {
      console.warn('Unknown action type:', data.type);
    }
  } catch (e) {
    console.error('Failed to parse webview message', e);
  }
};

export const sendEventToWeb = (webviewRef: RefObject<WebView | null>, type: string, payload = {}) => {
  if (!webviewRef.current) return;

  const message = JSON.stringify({ type, ...payload });
  webviewRef.current.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', { data: '${message}' }));
      true;
    `);
};
