# UltraDeepThink Demo

iPad→Mac キーボード入力デモアプリケーション

## 概要

iPadアプリからMacでキーボード入力をシミュレートするプロジェクトです。「ultradeepthink」という文字列をiPadのボタンから送信し、Mac側で自動的にキーボード入力として実行されます。

## プロジェクト構成

```
Side-Assist-plus/
├── UltraDeepThinkDemo/     # React Native iPad アプリ
│   ├── App.tsx             # メインアプリケーション
│   ├── ios/                # iOS設定とビルドファイル
│   └── package.json        # 依存関係
└── MacCompanion/           # Mac側コンパニオンアプリ
    ├── Sources/            # Swift ソースコード
    ├── test.sh             # テスト実行スクリプト
    └── Package.swift       # Swift Package設定
```

## 技術スタック

### iPad側 (React Native)
- React Native 0.80.1
- TypeScript
- iOS 15.1+

### Mac側 (Swift)
- Swift 5.0+
- CoreBluetooth (廃止済み)
- Network Framework (mDNS)
- Carbon Framework (キーボードシミュレーション)

## 開発経緯

### 試行したアプローチ

1. **BLE Central方式** ❌
   - iPadからMacへBluetooth接続
   - iOS HIDプロファイル制限により断念

2. **BLE Peripheral方式** ❌
   - `react-native-ble-peripheral`使用
   - `TypeError: Cannot read property 'addService' of null`
   - ライブラリの不安定性により断念

3. **mDNS + WebSocket方式** ❌
   - `react-native-zeroconf` + Node.js `ws`
   - React Native New Architectureとの競合
   - NSNetServicesErrorCode -72004

4. **クリップボード方式** ✅ (最終解決策)
   - 手動コピー + Mac側監視
   - 最もシンプルで確実な方法

## 使用方法

### 1. iPad側セットアップ

```bash
cd UltraDeepThinkDemo
pnpm install
pod install
pnpm run ios
```

### 2. Mac側セットアップ

```bash
cd MacCompanion
./test.sh
```

### 3. テスト実行

1. iPad: 「Start Service」ボタン
2. Mac: キーボードシミュレーション準備完了
3. iPad: 「Send "ultradeepthink"」ボタン
4. 手動で「ultradeepthink」をコピー
5. Mac: 自動でキーボード入力実行

## 学んだこと

- iOS App Storeアプリには厳しいBluetooth制限がある
- React Native New Architectureは一部ライブラリと競合する
- mDNSはiOSで複雑な権限設定が必要
- 最もシンプルなソリューションが最も確実

## ライセンス

MIT License