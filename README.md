# 🚀 Side Assist Plus

**モバイルボタン → デスクトップ自動入力 (クロスプラットフォーム対応)**

## 🎯 できること

iPhone/Androidで「ultradeepthink」ボタン → Mac/Windows/Linuxで自動入力される

## 📁 プロジェクト構成

```
Side-Assist-plus/
├── side-assist-desktop/    # Tauri v2 デスクトップアプリ
│   ├── src/               # React + TypeScript UI
│   ├── src-tauri/         # Rust バックエンド + HTTP サーバー
│   └── locales/           # 国際化 (日本語/英語)
├── side-assist-mobile/     # React Native モバイルアプリ
│   ├── src/               # コンポーネント分割済み
│   │   ├── components/    # UI コンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   ├── services/      # ネットワーク通信
│   │   └── styles/        # スタイル定義
│   └── ios/android/       # ネイティブプラットフォーム
└── docs/                  # ドキュメント
```

## ⚡ 超簡単！ワンコマンド実行

```bash
# ターミナル1: Tauri デスクトップアプリ (サーバー機能内蔵)
./run.sh desktop

# ターミナル2: Metro Bundler  
./run.sh metro

# ターミナル3: モバイルアプリ
./run.sh ios      # iOS (Xcode)
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

### モバイル (React Native)
- **フレームワーク**: React Native 0.80.1
- **言語**: TypeScript
- **アーキテクチャ**: コンポーネント分割 + カスタムフック
- **ネットワーク**: HTTP REST API + Service Discovery
- **バンドラー**: Metro Bundler
- **パッケージ管理**: npm


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
- [React Native セットアップ](side-assist-mobile/README.md)

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

**Q: Metro接続エラー**  
A: iPhone設定 → WiFi → Mac と同じネットワーク確認

**Q: Xcodeでビルドエラー**  
A: Bundle ID変更 + Team設定 (Apple ID)

**Q: アプリでサーバーが見つからない**  
A: 1. 同じWiFi確認 2. アプリの「Find Mac」ボタン 3. ローカルネットワーク権限確認

### 🤖 Android

**Q: "InitializeCore.js" エラー**  
A: `./stop.sh` → `./run.sh android` (自動修復済み)

**Q: Metro ポート競合**  
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
./run.sh metro          # Metro Bundler
./run.sh ios           # iOS または android
```

## 📄 ライセンス

MIT License