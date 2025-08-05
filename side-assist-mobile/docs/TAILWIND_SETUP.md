# TailwindCSS (NativeWind) 導入作業履歴

## 概要

React Native 0.80.1 プロジェクトに NativeWind v4 を導入して、TailwindCSS クラスを使用できるように設定しました。

## 実施した作業

### 1. 現状調査

- プロジェクト構造とモバイル設定の確認
- 既存の Tailwind 設定（不完全）を確認
- React Native 0.80.1 環境の把握

### 2. 最新情報調査

- NativeWind v4 の公式ドキュメント調査
- React Native 0.80 との互換性確認
- 過去の Babel エラー原因と回避策の特定

### 3. 依存関係のインストール

```bash
pnpm install nativewind tailwindcss@^3.4.17 react-native-reanimated@~3.17.5 react-native-safe-area-context@5.4.0
```

### 4. 設定ファイルの更新

#### babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

#### metro.config.js

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'svg'],
  },
};

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    input: './global.css',
  },
);
```

#### global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. App.tsx の更新

- global.css のインポートを追加
- 一部のスタイルを Tailwind クラスに変換（テスト用）
  - `style={appStyles.container}` → `className="flex-1 bg-gray-50"`
  - `style={appStyles.content}` → `className="flex-1 pt-5"`

## インストールされたパッケージ

- nativewind: ^4.1.23
- tailwindcss: ^3.4.17
- react-native-reanimated: ~3.17.5
- react-native-safe-area-context: 5.4.0

## 動作確認

- Metro サーバーの正常起動を確認
- ESLint チェック通過を確認
- TypeScript コンパイルエラーなし（既存の無関係エラー 1 件のみ）
- Tailwind クラスの基本動作を確認

## 注意事項

- Babel 設定変更後は必ず Metro サーバーを再起動（`pnpm start --reset-cache`）
- 既存のスタイルオブジェクトは段階的に Tailwind クラスに移行可能
- CustomButton コンポーネントは既に Tailwind クラスを使用済み

## 今後の作業

1. 既存のスタイルオブジェクトを段階的に Tailwind クラスに変換
2. カスタムスタイルの必要性を検証
3. パフォーマンステスト
4. 他のコンポーネントでの Tailwind クラス活用

## 完了日時

2025-08-05
