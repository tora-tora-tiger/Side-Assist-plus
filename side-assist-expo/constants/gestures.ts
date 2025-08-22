import { MaterialIcons } from "@expo/vector-icons";

// ジェスチャー方向の定義
export const GestureDirections = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;

export type GestureDirection =
  (typeof GestureDirections)[keyof typeof GestureDirections];

// ジェスチャーアクションの定義
export const GestureActions = {
  COPY: "copy",
  PASTE: "paste",
  TEXT_INPUT: "text_input",
  CUSTOM_ACTION: "custom_action",
  VOLUME_UP: "volume_up",
  VOLUME_DOWN: "volume_down",
} as const;

export type GestureAction =
  (typeof GestureActions)[keyof typeof GestureActions];

// ジェスチャー設定の型定義
export interface GestureMapping {
  id: string;
  fingers: number; // 指の本数（1-4）
  direction: GestureDirection;
  action: GestureAction;
  actionData?: string; // テキスト入力やカスタムアクションIDなど
  displayName: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
  enabled: boolean;
}

// デフォルトジェスチャーマッピング（システムジェスチャー競合回避済み）
export const DefaultGestureMappings: GestureMapping[] = [
  {
    id: "2-finger-up-copy",
    fingers: 2,
    direction: GestureDirections.UP,
    action: GestureActions.COPY,
    displayName: "コピー",
    icon: "content-copy",
    description: "クリップボードにコピー（安全なジェスチャー）",
    enabled: true,
  },
  {
    id: "2-finger-down-paste",
    fingers: 2,
    direction: GestureDirections.DOWN,
    action: GestureActions.PASTE,
    displayName: "ペースト",
    icon: "content-paste",
    description: "クリップボードから貼り付け（安全なジェスチャー）",
    enabled: true,
  },
  {
    id: "2-finger-left-text",
    fingers: 2,
    direction: GestureDirections.LEFT,
    action: GestureActions.TEXT_INPUT,
    actionData: "ultradeepthink",
    displayName: "テキスト入力",
    icon: "psychology",
    description: "ultradeepthinkと入力（安全なジェスチャー）",
    enabled: true,
  },
  {
    id: "2-finger-right-custom1",
    fingers: 2,
    direction: GestureDirections.RIGHT,
    action: GestureActions.CUSTOM_ACTION,
    displayName: "カスタムアクション1",
    icon: "play-arrow",
    description: "最初のカスタムアクションを実行（安全なジェスチャー）",
    enabled: true,
  },
];

// ジェスチャー検出の設定
export const GestureConfig = {
  MIN_SWIPE_DISTANCE: 50, // 最小スワイプ距離（ピクセル）
  MAX_GESTURE_TIME: 2000, // 最大ジェスチャー時間（ミリ秒）
  MIN_GESTURE_TIME: 100, // 最小ジェスチャー時間（ミリ秒）
  FINGER_TOLERANCE: 30, // 指の位置許容誤差（ピクセル）
  DEBOUNCE_TIME: 300, // ジェスチャー間のデバウンス時間（ミリ秒）
} as const;

// ジェスチャーの状態
export const GestureStates = {
  IDLE: "idle",
  DETECTING: "detecting",
  RECOGNIZED: "recognized",
  EXECUTING: "executing",
  COMPLETED: "completed",
} as const;

export type GestureState = (typeof GestureStates)[keyof typeof GestureStates];

// ジェスチャーイベントの型定義
export interface GestureEvent {
  id: string;
  fingers: number;
  direction: GestureDirection;
  startTime: number;
  endTime: number;
  distance: number;
  velocity: number;
  confidence: number; // 信頼度（0-1）
}

// ジェスチャーの結果
export interface GestureResult {
  detected: boolean;
  mapping?: GestureMapping;
  event?: GestureEvent;
  error?: string;
}
