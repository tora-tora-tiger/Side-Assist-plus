# Ultra Deep Think Demo App

iPad用Bluetooth連携デモアプリです。iPadからMacにBluetooth接続して「ultradeepthink」という文字列を送信します。

## 機能

- **Scan for Mac**: 近くのMacデバイスをスキャン
- **Send "ultradeepthink"**: 接続されたMacに文字列を送信
- **Disconnect**: Bluetooth接続を切断

## 技術構成

- **Framework**: React Native 0.80.1
- **Language**: TypeScript
- **Package Manager**: pnpm
- **BLE Library**: react-native-ble-plx 3.5.0
- **Target**: iPad (iOS)

## セットアップ手順

1. **依存関係インストール**
```bash
pnpm install
```

2. **iOS設定**
```bash
cd ios && pod install
```

3. **実行**
```bash
# iOS (実機またはシミュレータ)
pnpm run ios

# Android
pnpm run android
```

## 重要な設定

### iOS権限 (Info.plist)
- `NSBluetoothAlwaysUsageDescription`
- `NSBluetoothPeripheralUsageDescription`
- `NSLocationWhenInUseUsageDescription`

### Android権限 (AndroidManifest.xml)
- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `ACCESS_FINE_LOCATION`

## 使用方法

1. iPadでアプリを起動
2. "Scan for Mac"ボタンを押してMacデバイスを検索
3. Macが見つかったら自動接続
4. "Send ultradeepthink"ボタンを押して文字列送信
5. 必要に応じて"Disconnect"で切断

## 注意事項

- 実機での動作確認が必要
- MacのBluetooth設定で検出可能にする必要があります
- BLEの仕様上、接続可能なサービスが存在する必要があります