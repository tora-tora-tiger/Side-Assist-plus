# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Side Assist Plusは、モバイルアプリとデスクトップアプリの連携により、iPhone/AndroidデバイスからMac/Windows/Linuxマシンへのキーボード入力自動化を実現するクロスプラットフォームアプリです。

**⚠️ 重要: npmを使用すること！pnpm使用禁止！**
モバイル開発（Expo Go）では必ずnpmを使用してください。pnpmは依存関係の問題で破綻します。

## 開発コマンド

### 基本起動コマンド
```bash
# デスクトップアプリ起動（サーバー機能内蔵）
./pc.sh

# モバイルアプリ開発サーバー起動
./mo.sh
```

### デスクトップアプリ（side-assist-desktop/）
- **開発**: `npm run dev`
- **本番ビルド**: `npm run build`
- **Tauriアプリ実行**: `npm run tauri dev`
- **リント**: `npm run lint`、`npm run lint:fix`
- **フォーマット**: `npm run format`

### モバイルアプリ（side-assist-expo/）
- **開発サーバー**: `npm start`
- **型チェック**: `npm run typecheck`
- **リント**: `npm run lint`、`npm run lint:fix`
- **フォーマット**: `npm run format`

### プロジェクト全体
- **Lefthookインストール**: `npm run lefthook:install`
- **コミット前チェックテスト**: `npm run hooks:test`

## アーキテクチャ

### デスクトップアプリ（Tauri v2）
- **フロントエンド**: React + TypeScript + TailwindCSS v4
- **バックエンド**: Rust + Axum HTTP Server (Port 8080)
- **キーボード制御**: enigo + rdevライブラリ
- **国際化**: react-i18next（日本語/英語）
- **パッケージマネージャー**: npm

### モバイルアプリ（Expo Router v5）
- **フレームワーク**: Expo Go + React Native
- **ナビゲーション**: Expo Router v5
- **スタイリング**: TailwindCSS v3.4 + NativeWind v4
- **QRスキャン**: Expo Camera API
- **パッケージマネージャー**: npm（pnpm使用禁止）

### 通信システム
- **HTTPサーバー**: デスクトップアプリがPort 8080で待機
- **リアルタイム監視**: 5秒間隔ハートビート（`/health`）
- **自動再接続**: 接続断時の自動復旧
- **クライアント管理**: デスクトップ側で接続数表示

## コードベース構造

```
├── side-assist-desktop/        # Tauriデスクトップアプリ
│   ├── src/                   # Reactフロントエンド
│   ├── src-tauri/             # Rustバックエンド
│   │   ├── src/
│   │   │   ├── keyboard.rs    # キーボード制御
│   │   │   ├── network.rs     # HTTPサーバー
│   │   │   └── storage.rs     # データ永続化
│   │   └── Cargo.toml
│   └── package.json
├── side-assist-expo/          # Expo React Nativeアプリ  
│   ├── app/                   # Expo Router画面
│   ├── components/            # UIコンポーネント
│   ├── services/              # ネットワーク・権限管理
│   └── package.json
├── lefthook.yml              # Gitフック設定
├── pc.sh                     # デスクトップ起動スクリプト  
└── mo.sh                     # モバイル起動スクリプト
```

## 開発規則

### パッケージマネージャー
- **デスクトップ**: npm使用
- **モバイル**: npm使用

### バージョン管理の重要事項
- **React**: Expo推奨バージョン（19.0.0）を厳守
  - `react`, `react-dom`, `react-test-renderer`は全て同一バージョンに統一
  - バージョン不一致は`react-native-renderer`との競合を引き起こす
- **Dependencies**: Expo推奨バージョンに合わせる
  - `react-native-safe-area-context`: 5.4.0使用

### コード品質管理
- **Lefthook**: 自動lint/format（コミット前）
- **ESLint + Prettier**: 両プラットフォーム共通設定
- **TypeScript**: 厳格な型チェック

### 権限管理
- **macOS**: アクセシビリティ権限（キーボード制御用）
- **iOS**: ローカルネットワーク権限（サーバー発見用）
- **Android**: ネットワーク権限

## トラブルシューティング

### ポート競合
```bash
# プロセス確認・終了
lsof -ti:1420,8080 | xargs kill -9
```

### 権限問題
- **macOS**: システム環境設定 → プライバシーとセキュリティ → アクセシビリティ
- **iOS**: アプリ設定 → ローカルネットワーク許可

### React/Expo バージョン不一致エラー
```
Incompatible React versions: react-native-renderer vs react
```
**解決法:**
1. ReactバージョンをExpo推奨バージョンに統一（19.0.0）
2. 完全クリーンインストール: `rm -rf node_modules package-lock.json && npm install`
3. useColorSchemeは直接React Nativeからインポート: `import { useColorScheme } from "react-native"`

### Expo Metro問題
- `./mo.sh`で自動プロセス管理
- キャッシュクリア: `npx expo start -c`
- ポート競合時は既存プロセス終了後に再起動

## 特記事項

- **React**: Expo 53.0.20はReact 19.0.0を推奨（19.1.1は非互換）
- **TailwindCSS**: v4使用（デスクトップ）、v3.4使用（モバイル、NativeWind v4対応のため）
- **Rust依存関係**: rdev（フォーク版）、enigo、axum、tokio
- **国際化対応**: 日本語・英語サポート
- **クロスプラットフォーム**: Windows/macOS/Linux完全対応
- **useColorScheme**: カスタムコンポーネント不要、React Nativeから直接インポート