# 🚀 Side Assist Plus

# pnpmを使うな！！！壊れる！！！

---

**モバイルボタン → デスクトップ自動入力 (クロスプラットフォーム対応)**

## 📦 自動インストールされる依存関係

`./run.sh` を実行すると以下の依存関係が自動的にインストールされます：

### 必要な前提条件とインストール方法

#### 🍎 macOS
```bash
# Homebrew経由で一括インストール
brew install node pnpm rust android-platform-tools
brew install --cask android-studio

# iOS開発用 (App Store経由)
# Xcode をApp Storeからインストール

# ⚠️ CocoaPods手動インストール (重要: sudo失敗時の対処)
sudo gem install cocoapods
# sudoでエラーが出る場合は以下の手順で手動インストール:
# 1. Homebrew経由でインストール
# brew install cocoapods
# 2. またはrbenv経由
# gem install cocoapods --user-install
```

#### 🪟 Windows
```powershell
# Chocolatey経由で一括インストール
choco install nodejs pnpm rust android-sdk
# または
winget install OpenJS.NodeJS
winget install pnpm.pnpm
winget install Rustlang.Rustup
```

#### 🐧 Linux (Ubuntu/Debian)
```bash
# Node.js & pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Android SDK
sudo apt-get install android-sdk adb
```

#### 必須コンポーネント
- **Node.js** (v18+): JavaScript/TypeScript実行環境
- **pnpm**: 高速パッケージマネージャー
- **Rust**: Tauri v2デスクトップアプリ用
- **Android SDK & ADB**: Android開発・デバッグ用
- **Xcode & CocoaPods**: iOS開発用 (macOSのみ)

### 自動実行されるインストールコマンド

#### デスクトップアプリ (`./run.sh desktop`)
```bash
cd side-assist-desktop && pnpm install    # Node.js依存関係
```

#### iOS アプリ (`./run.sh ios`)
```bash
cd side-assist-expo && pnpm install       # Node.js依存関係
cd ios && pod install && cd ..            # CocoaPods依存関係
```

⚠️ **初回実行前に必須**: CocoaPodsを手動でインストールしてください（上記macOSセクション参照）

#### Android アプリ (`./run.sh android`)
```bash
cd side-assist-expo && pnpm install       # Node.js依存関係
adb reverse tcp:8081 tcp:8081             # ADB ポート転送設定
```

### パッケージの詳細
- **Tauri v2**: Rust + React デスクトップアプリフレームワーク
- **Expo Router v5**: React Native + TypeScript モバイルフレームワーク
- **TailwindCSS v3.4**: UI スタイリング
- **NativeWind v4**: React Native用 Tailwind実装
- **Expo Camera**: QRコードスキャン機能
- **CocoaPods**: iOS ネイティブ依存関係管理

## 🎯 できること

iPhone/Androidで「ultradeepthink」ボタン → Mac/Windows/Linuxで自動入力される

## 教訓

~~旧時代の話~~
- androidのビルドで、node_modulesの構造の違いでpnpmではエラーがおきたから。

- react nativeだとtabler-iconとか使えなかった。
---

⏺ TailwindCSS v4とNativeWind v4の最新情報（2025年）:

  現在、NativeWind v4はTailwindCSS v3.4.xを使用しています。TailwindCSS 
  v4はまだNativeWindでは完全にサポートされていません。


- expoで、pnpmつかうと破壊される(n敗)https://github.com/expo/expo/issues/28703

## ⚡ 超簡単！ワンコマンド実行

```bash
# ターミナル1: Tauri デスクトップアプリ (サーバー機能内蔵)
./run.sh desktop

# ターミナル2: Expo モバイルアプリ
./run.sh ios      # iOS (自動ビルド)
# または
./run.sh android  # Android (完全自動)
```

### 🛑 全停止
```bash
./stop.sh  # 全プロセス自動終了 (Tauri + Metro)
```

## 🎮 使い方

1. **Android実機**: USBデバッグ有効 + USB接続
2. **コマンド実行**: `./run.sh android` 
3. **自動完了**: アプリが実機に自動インストール&起動
4. **ボタンタップ**: 「ultradeepthink」→ Mac で自動入力！

## 📱 対応プラットフォーム

### デスクトップ (サーバー側)
| プラットフォーム | 実装状況 | 実行コマンド | 備考 |
|-------------|---------|------------|------|
| **macOS** | ✅ 完成 | `./run.sh desktop` | Tauri v2 |
| **Windows** | ✅ 完成 | `./run.sh desktop` | Tauri v2 クロスプラットフォーム |
| **Linux** | ✅ 完成 | `./run.sh desktop` | Tauri v2 クロスプラットフォーム |

### モバイル (クライアント側)
| プラットフォーム | 実装状況 | 実行コマンド | 自動化レベル |
|-------------|---------|------------|------------|
| **Android** | ✅ 完成 | `./run.sh android` | 🤖 完全自動 |
| **iOS** | ✅ 完成 | `./run.sh ios` + `./run.sh metro` | ⚡ 半自動 |

## 🛠️ 技術スタック

### デスクトップ (Tauri v2 - 推奨)
- **フロントエンド**: React + TypeScript + Tailwind CSS v4
- **バックエンド**: Rust + Axum HTTP Server  
- **入力シミュレーション**: enigo (クロスプラットフォーム)
- **国際化**: react-i18next (日本語/英語)
- **パッケージ管理**: pnpm
- **コード品質**: ESLint + Prettier + Lefthook

### モバイル (Expo Router v5)
- **フレームワーク**: Expo Router v5 + React Native
- **言語**: TypeScript  
- **スタイル**: TailwindCSS v3.4 + NativeWind v4
- **カメラ**: Expo Camera API (QRスキャン)
- **ナビゲーション**: Expo Router
- **バンドラー**: Expo Metro Bundler
- **パッケージ管理**: pnpm


## 🔧 最適化機能

### デスクトップ
- **クロスプラットフォーム**: Windows/macOS/Linux 単一コードベース
- **パフォーマンス**: Rust ネイティブパフォーマンス
- **UI**: システムフォント使用でプライバシー&パフォーマンス向上
- **国際化**: ブラウザ言語検出 + リアルタイム切り替え

### モバイル  
- **コード品質**: 自動lint/format + git hooks
- **アーキテクチャ**: 機能別コンポーネント分割
- **ビルド高速化**: Gradle 並列実行 + キャッシュ
- **Metro最適化**: InitializeCore.js 問題解決
- **自動プロセス管理**: PID追跡 + 自動終了
- **リアルタイム通信**: ハートビート監視 + 自動再接続

## 🔄 通信システム

### **リアルタイム接続監視**
- **5秒間隔ハートビート**: 自動接続状態チェック
- **即座に検出**: Mac停止を最大7秒で検出
- **自動回復**: 接続断時に自動スキャン&再接続
- **クライアント管理**: Mac側で接続数表示

### **通信フロー**
```
モバイル            Mac
   |                |
   |---> /health ---|  (5秒間隔)
   |<--- 200 OK ----|  (クライアント登録)
   |                |
   [Ctrl+C Mac]     |
   |                X  (サーバー停止)
   |---> /health ---|  
   |<--- timeout ---|  (2秒後検出)
   |                |
   [自動再接続開始]    |
```

### **堅牢性**
- **タイムアウト処理**: 2秒でタイムアウト検出
- **メモリリーク防止**: 15秒無応答クライアント自動削除
- **エラー回復**: ネットワーク変更時も自動対応

## 📋 詳細ドキュメント

- [Android実機デバッグガイド](docs/ANDROID_DEBUG.md)
- [Expo Router セットアップ](side-assist-expo/README.md)

## 🚨 トラブルシューティング

### 🖥️ Tauri デスクトップ (新構成)

**Q: "アクセシビリティ権限が必要" エラー**  
A: システム環境設定 → プライバシーとセキュリティ → アクセシビリティ → ターミナル追加

**Q: "ポート1420使用中" エラー**  
A: `./stop.sh` → `./run.sh desktop` (自動解決)

**Q: ネットワーク接続許可ダイアログが表示されない**  
A: 起動後10-15秒待機。表示されたら「許可」を選択

**Q: キーボード入力が効かない**  
A: システム環境設定でアクセシビリティ権限を再確認

### 📱 iOS

**Q: "ローカルネットワーク使用許可" ダイアログ**  
A: 必ず「許可」を選択 (サーバー発見に必要)

**Q: Expo Metro接続エラー**  
A: iPhone設定 → WiFi → Mac と同じネットワーク確認

**Q: Xcodeでビルドエラー**  
A: Bundle ID変更 + Team設定 (Apple ID)

**Q: アプリでサーバーが見つからない**  
A: 1. 同じWiFi確認 2. アプリの「Find Mac」ボタン 3. ローカルネットワーク権限確認

### 🤖 Android

**Q: "InitializeCore.js" エラー**  
A: `./stop.sh` → `./run.sh android` (Expoで解決済み)

**Q: Expo Metro ポート競合**  
A: `./stop.sh` でプロセス自動終了

**Q: 実機が認識されない**  
A: USB デバッグ有効 + `adb devices` で確認

### 🔧 共通問題

**Q: 接続が突然切れる**  
A: 自動で5秒以内に再接続試行 (ハートビート監視)

**Q: サーバーが起動しない**  
A: `./stop.sh` → 関連プロセス終了 → 再起動

### 🛑 緊急時完全リセット
```bash
./stop.sh              # 全プロセス強制終了
./run.sh desktop        # Tauri デスクトップ (推奨)
./run.sh metro          # Expo Metro Bundler
./run.sh ios           # iOS または android
```

## 📄 ライセンス

MOOSHIMOSHI License