// Web to Native message types
export enum WebToNativeMessageType {
  WEB_APP_READY = 'WEB_APP_READY',
  BACK_ACTION = 'BACK_ACTION',
  EXIT_ACTION = 'EXIT_ACTION',
  SHOW_AD = 'SHOW_AD',
  NEED_TO_LOGIN = 'NEED_TO_LOGIN',
}

// Native to Web message types
export enum NativeToWebMessageType {
  CAN_BACK_STATE = 'CAN_BACK_STATE',
  GOOGLE_ID_TOKEN = 'GOOGLE_ID_TOKEN',
  AD_RESULT = 'AD_RESULT',
  PURCHASE_RESULT = 'PURCHASE_RESULT',
  NATIVE_ERROR = 'NATIVE_ERROR',
}

// Base message interface
export interface BaseMessage<T = unknown> {
  type: string;
  payload?: T;
}

// Web to Native message payloads
export interface WebAppReadyPayload {
  timestamp: string;
}

export interface UpdateEnergyPayload {
  change: number;
  newValue: number;
}

export interface ShowAdPayload {
  reason: 'energy_refill' | 'reward' | 'purchase';
}

// Native to Web message payloads
export interface NavigateStatePayload {
  canGoBack: boolean;
}

export interface AdResultPayload {
  success: boolean;
  reason: string;
}

export interface NativeErrorPayload {
  message: string;
  stack?: string;
}

export interface LoginSuccessPayload {
  success: boolean;
}

// Typed message interfaces
export type WebToNativeMessage<T = unknown> = BaseMessage<T> & {
  type: WebToNativeMessageType;
};

export type NativeToWebMessage<T = unknown> = BaseMessage<T> & {
  type: NativeToWebMessageType;
};
