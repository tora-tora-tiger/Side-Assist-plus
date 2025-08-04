# 🚀 UltraDeepThink

**モバイルボタン → Mac自動入力**

## 🎯 できること

iPhone/Androidで「ultradeepthink」ボタン → Macで自動入力される

## ⚡ クイックスタート

### 1. Mac側サーバー起動
```bash
./run.sh mac
```

### 2. モバイルアプリ起動
```bash
# iPhone の場合
./run.sh ios      # Xcode + Metro起動

# Android の場合  
./run.sh android  # Android Studio + Metro起動
```

### 3. 実機でビルド&実行
- **iOS**: Xcode → iPhone実機選択 → ▶️
- **Android**: Android Studio → Android実機選択 → ▶️ Run 'app'

### 4. テスト
アプリで「ultradeepthink」ボタンタップ → Mac画面で自動入力！

## 📱 対応プラットフォーム

| プラットフォーム | 実装状況 | ビルド方法 |
|-------------|---------|----------|
| **iOS** | ✅ 完成 | Xcode → 実機ビルド |
| **Android** | ✅ 完成 | Android Studio → 実機ビルド |
| **macOS** | ✅ 完成 | Swift CLI |

## 🛠️ 技術スタック

- **モバイル**: React Native (クロスプラットフォーム)
- **サーバー**: Swift (macOS)
- **通信**: HTTP REST API + ネットワークスキャン
- **入力**: macOS Accessibility API

## 📋 詳細ドキュメント

- [Android実機デバッグガイド](docs/ANDROID_DEBUG.md)
- [React Native セットアップ](UltraDeepThinkDemo/README.md)

## 🚨 トラブルシューティング

### 共通
**Q: アプリでMacが見つからない**  
A: 同じWi-Fiか確認 → アプリの「Find Mac」ボタン

**Q: アクセシビリティ権限エラー**  
A: システム環境設定 → プライバシー → アクセシビリティ → ターミナル追加

### iOS固有
**Q: Xcodeでビルドエラー**  
A: Bundle ID変更 + Team設定 (Apple ID)

### Android固有
**Q: 実機が認識されない**  
A: USB デバッグ有効 + `adb devices` で確認

## 📄 ライセンス

MIT License