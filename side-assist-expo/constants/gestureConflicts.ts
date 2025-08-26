// iOSシステムジェスチャーとの競合を回避するための定義

export interface SystemGestureConflict {
  fingers: number;
  direction: string;
  systemAction: string;
  workaround: string;
}

// システムジェスチャーとの競合情報
export const SystemGestureConflicts: SystemGestureConflict[] = [
  {
    fingers: 4,
    direction: "up",
    systemAction: "アプリスイッチャーを開く",
    workaround: "アプリ内専用エリアでのみ検出",
  },
  {
    fingers: 5,
    direction: "up",
    systemAction: "ホーム画面へ戻る",
    workaround: "5本指ジェスチャーは無効化",
  },
  {
    fingers: 3,
    direction: "up",
    systemAction: "Dock表示",
    workaround: "アプリ内専用エリアでのみ検出",
  },
  {
    fingers: 3,
    direction: "left",
    systemAction: "前のアプリに切り替え",
    workaround: "アプリ内専用エリアでのみ検出",
  },
  {
    fingers: 3,
    direction: "right",
    systemAction: "次のアプリに切り替え",
    workaround: "アプリ内専用エリアでのみ検出",
  },
];

// 競合回避戦略
export const ConflictAvoidanceStrategies = {
  // 専用検出エリア戦略
  DEDICATED_AREA: {
    name: "専用検出エリア",
    description: "アプリ内の特定エリアでのみジェスチャーを検出",
    advantages: [
      "システムジェスチャーとの完全分離",
      "ユーザーが意図的にジェスチャーエリアを使用",
      "誤作動の防止",
    ],
    disadvantages: ["画面領域の一部を専有", "ジェスチャーエリア外では使用不可"],
  },

  // エッジ回避戦略
  EDGE_AVOIDANCE: {
    name: "エッジ回避",
    description: "画面端から一定距離離れた場所でのみ検出",
    advantages: [
      "システムジェスチャーの多くは画面端から開始",
      "より自然な操作感",
    ],
    disadvantages: [
      "完全な競合回避は困難",
      "一部のシステムジェスチャーと重複の可能性",
    ],
  },

  // 時間差戦略
  TIMING_STRATEGY: {
    name: "時間差検出",
    description: "システムジェスチャーより短い時間での検出",
    advantages: ["高速なジェスチャー認識", "レスポンシブな操作感"],
    disadvantages: ["誤認識のリスク増加", "ユーザーの慣れが必要"],
  },
} as const;

// 推奨設定
export const RecommendedGestureSettings = {
  // システムジェスチャーと競合しない安全なジェスチャー
  SAFE_GESTURES: [
    { fingers: 2, direction: "up", reason: "システムで使用されていない" },
    { fingers: 2, direction: "down", reason: "システムで使用されていない" },
    { fingers: 2, direction: "left", reason: "システムで使用されていない" },
    { fingers: 2, direction: "right", reason: "システムで使用されていない" },
  ],

  // 注意が必要なジェスチャー（アプリ内エリア限定推奨）
  CAUTION_GESTURES: [
    { fingers: 3, direction: "up", reason: "Dock表示と競合" },
    { fingers: 3, direction: "left", reason: "アプリ切り替えと競合" },
    { fingers: 3, direction: "right", reason: "アプリ切り替えと競合" },
    { fingers: 4, direction: "up", reason: "アプリスイッチャーと競合" },
  ],

  // 使用を避けるべきジェスチャー
  AVOID_GESTURES: [
    { fingers: 5, direction: "up", reason: "ホーム画面と競合" },
    { fingers: 1, direction: "up", reason: "スクロールと競合" },
    { fingers: 1, direction: "down", reason: "スクロールと競合" },
  ],
} as const;
