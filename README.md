# 🚀 Side Assist

**モバイルボタン → Mac自動入力**

## 🎯 できること

iPhone/Androidで「ultradeepthink」ボタン → Macで自動入力される

## 📁 プロジェクト構成

```
Side-Assist-plus/
├── side-assist-mobile/     # React Nativeモバイルアプリ
├── side-assist-server/     # Swift HTTPサーバー (一時的)
├── side-assist-desktop/    # Tauriデスクトップアプリ (今後)
└── docs/                  # ドキュメント
```

## ⚡ 超簡単！ワンコマンド実行

### 🍎 iOS の場合
```bash
# ターミナル1: Mac サーバー
./run.sh mac

# ターミナル2: iOS アプリ
./run.sh ios    # Xcode のみ起動

# ターミナル3: Metro Bundler
./run.sh metro  # Metro 起動
```

### 🤖 Android の場合 (完全自動)
```bash
# ターミナル1: Mac サーバー  
./run.sh mac

# ターミナル2: Android 完全自動実行  
./run.sh android  # 全て自動: Metro + ADB設定 + ビルド + 実行
```

### 🛑 全停止
```bash
./stop.sh  # 全プロセス自動終了
```

## 🎮 使い方

1. **Android実機**: USBデバッグ有効 + USB接続
2. **コマンド実行**: `./run.sh android` 
3. **自動完了**: アプリが実機に自動インストール&起動
4. **ボタンタップ**: 「ultradeepthink」→ Mac で自動入力！

## 📱 対応プラットフォーム

| プラットフォーム | 実装状況 | 実行コマンド | 自動化レベル |
|-------------|---------|------------|------------|
| **Android** | ✅ 完成 | `./run.sh android` | 🤖 完全自動 |
| **iOS** | ✅ 完成 | `./run.sh ios` + `./run.sh metro` | ⚡ 半自動 |
| **macOS** | ✅ 完成 | `./run.sh mac` | 🚀 ワンコマンド |

## 🛠️ 技術スタック

- **モバイル**: React Native 0.80.1 (クロスプラットフォーム)
- **バンドラー**: Metro Bundler (最適化済み)
- **サーバー**: Swift HTTP Server (macOS)
- **通信**: HTTP REST API + ADB ポート転送
- **入力**: macOS Accessibility API
- **パッケージ管理**: npm (最適化済み)

## 🔧 最適化機能

- **ビルド高速化**: Gradle 並列実行 + キャッシュ
- **Metro最適化**: InitializeCore.js 問題解決
- **自動プロセス管理**: PID追跡 + 自動終了
- **エラー回避**: キャッシュクリア + ADB自動設定
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

### 🤖 Android 自動解決
**Q: "InitializeCore.js" エラー**  
A: `./stop.sh` → `./run.sh android` (自動修復済み)

**Q: Metro ポート競合**  
A: `./stop.sh` でプロセス自動終了

**Q: 実機が認識されない**  
A: USB デバッグ有効 + `adb devices` で確認

**Q: 接続が突然切れる**  
A: 自動で5秒以内に再接続試行 (ハートビート監視)

### 🍎 iOS 手動設定
**Q: Xcodeでビルドエラー**  
A: Bundle ID変更 + Team設定 (Apple ID)

**Q: Metro が起動しない**  
A: 別ターミナルで `./run.sh metro`

### 🖥️ 共通
**Q: アプリでMacが見つからない**  
A: 同じWi-Fiか確認 → アプリの「Find Mac」ボタン

**Q: アクセシビリティ権限エラー**  
A: システム環境設定 → プライバシー → アクセシビリティ → ターミナル追加

### 🛑 緊急時
```bash
./stop.sh          # 全プロセス強制終了
./run.sh android   # 完全リセット&再実行
```

## 📄 ライセンス

MIT License