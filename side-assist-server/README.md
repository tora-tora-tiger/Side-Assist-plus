# Mac Companion App for UltraDeepThink

このMacアプリは、iPadの「UltraDeepThink」アプリからBluetooth経由でメッセージを受信し、キーボード入力として再生します。

## 機能

- iPadアプリの「UltraDeepThink Keyboard」を自動検出
- カスタムBLEサービス経由でメッセージ受信
- 受信したテキストをキーボード入力としてシミュレート
- 自動再接続機能

## 使用方法

### 1. ビルドと実行

```bash
# Macでビルド
swift build

# 実行
swift run
```

### 2. 使用手順

1. **Macアプリを起動**
```bash
swift run MacCompanion
```

2. **iPadアプリで「Start Advertising」**
   - iPadが「UltraDeepThink Keyboard」として検出可能になります

3. **自動接続**
   - Macアプリが自動的にiPadを検出・接続します
   - 「Ready to receive keyboard input!」と表示されれば成功

4. **メッセージ送信**
   - iPadで「Send "ultradeepthink"」ボタンを押します
   - Macで現在アクティブなアプリに「ultradeepthink」が入力されます

## デバッグ情報

実行時に以下のログが表示されます：

```
🚀 MacCompanion started
📱 Looking for UltraDeepThink iPad...
✅ Bluetooth powered on
🔍 Scanning for UltraDeepThink devices...
📡 Discovered: UltraDeepThink (RSSI: -45)
🎯 Found UltraDeepThink device: UltraDeepThink
✅ Connected to UltraDeepThink
🔍 Discovered 1 services
📋 Service: 12345678-1234-1234-1234-123456789abc
✅ Found our custom service!
🔍 Discovered 1 characteristics
📝 Characteristic: 87654321-4321-4321-4321-cba987654321
✅ Found message characteristic!
✅ Subscribed to message notifications
🎹 Ready to receive keyboard input!
📨 Received message: 'ultradeepthink'
⌨️  Simulating keyboard input: 'ultradeepthink'
✅ Keyboard simulation complete
```

## 必要な権限

初回実行時にmacOSから以下の権限が要求されます：

1. **Bluetooth権限**: iPad検出のため
2. **Accessibility権限**: キーボード入力シミュレーションのため
   - システム設定 → プライバシーとセキュリティ → アクセシビリティ
   - 「MacCompanion」を許可

## トラブルシューティング

### iPadが見つからない場合
- iPadのBluetoothがオンになっているか確認
- iPadアプリで「Start Advertising」が実行されているか確認
- 距離を近づける（1-2m以内）

### キーボード入力が動作しない場合
- システム設定でアクセシビリティ権限を確認
- アクティブなアプリでテキスト入力が可能か確認
- Macアプリを再起動

### 接続が不安定な場合
- 他のBluetoothデバイスとの干渉を確認
- iPadアプリを再起動
- Macのアプリを再起動

## 技術仕様

- **言語**: Swift 5.9
- **対応OS**: macOS 13.0以上
- **フレームワーク**: CoreBluetooth, Carbon
- **BLEサービス**: 12345678-1234-1234-1234-123456789abc
- **特性**: 87654321-4321-4321-4321-cba987654321