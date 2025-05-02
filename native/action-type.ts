// Web to Native message types
export enum WebToNativeMessageType {
  WEB_APP_READY = 'WEB_APP_READY',
  BACK_ACTION = 'BACK_ACTION',
  EXIT_ACTION = 'EXIT_ACTION',
  UPDATE_ENERGY = 'UPDATE_ENERGY',
  SHOW_AD = 'SHOW_AD',
  MAKE_PURCHASE = 'MAKE_PURCHASE',
  GET_USER_INFO = 'GET_USER_INFO',
}

// Native to Web message types
export enum NativeToWebMessageType {
  CAN_BACK_STATE = 'CAN_BACK_STATE',
  GOOGLE_ID_TOKEN = 'GOOGLE_ID_TOKEN',
  AD_RESULT = 'AD_RESULT',
  PURCHASE_RESULT = 'PURCHASE_RESULT',
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

export interface MakePurchasePayload {
  productId: string;
  quantity: number;
}

// Native to Web message payloads
export interface NavigateStatePayload {
  canGoBack: boolean;
}

export interface SetUserInfoPayload {
  name: string;
  energy: number;
  gems: number;
  level: number;
}

export interface AdResultPayload {
  success: boolean;
  reason: string;
}

export interface PurchaseResultPayload {
  success: boolean;
  productId: string;
  transaction: {
    id: string;
  };
}

// Typed message interfaces
export type WebToNativeMessage<T = unknown> = BaseMessage<T> & {
  type: WebToNativeMessageType;
};

export type NativeToWebMessage<T = unknown> = BaseMessage<T> & {
  type: NativeToWebMessageType;
};
