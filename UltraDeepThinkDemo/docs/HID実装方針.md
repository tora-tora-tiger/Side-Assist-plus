# Bluetooth HID キーボード実装方針

## 概要
iPadアプリからMac/Windows/Linuxに「ultradeepthink」という文字列を送信するため、Bluetooth HIDプロファイル（キーボード）を使用する。

## 要件
- **設定不要（初回ペアリング除く）**: 特別なソフトウェア不要
- **クロスプラットフォーム**: Mac、Windows、Linux対応
- **シンプル**: ボタン1つで文字列送信
- **信頼性**: 標準Bluetoothプロトコル使用

## 技術仕様

### 使用プロトコル
- **Bluetooth HID Profile** (Human Interface Device)
- **Service UUID**: 0x1812 (HID Service)
- **Characteristic UUID**: 0x2A4D (HID Report)

### キーボードレポート形式
```
HID Report Format:
[Modifier] [Reserved] [Key1] [Key2] [Key3] [Key4] [Key5] [Key6]

例：'u' = 0x18, 'l' = 0x0F, 't' = 0x17, 'r' = 0x15, 'a' = 0x04
```

### 実装アプローチ
1. **react-native-ble-plx**: BLE通信基盤
2. **カスタムHIDモジュール**: キーボードレポート生成
3. **ネイティブ実装**: iOS Core Bluetooth + HID

## 初回セットアップ手順（ユーザー向け）

### iPad側
1. アプリ起動
2. 「キーボードとして設定」ボタン押下
3. Bluetooth設定でペアリング待機

### PC/Mac側
1. Bluetooth設定を開く
2. 新デバイス追加
3. 「UltraDeepThink Keyboard」を選択
4. ペアリング完了

### 以降の使用
1. アプリ起動
2. 「Send ultradeepthink」ボタン押下
3. 接続先PCで文字列入力

## 技術課題と解決策

### 課題1: React Native HIDライブラリなし
**解決策**: ネイティブモジュール作成
- iOS: Core Bluetooth + HID
- TypeScript: Bridge経由でネイティブ呼び出し

### 課題2: HIDレポート生成
**解決策**: キーコードマッピング実装
```typescript
const keyMap = {
  'u': 0x18, 'l': 0x0F, 't': 0x17, 'r': 0x15, 'a': 0x04,
  'd': 0x07, 'e': 0x08, 'p': 0x13, 'h': 0x0B, 'i': 0x0C,
  'n': 0x11, 'k': 0x0E
};
```

### 課題3: ペアリング管理
**解決策**: Bluetooth設定連携
- 自動ペアリングモード
- 接続状態監視
- 再接続ロジック

## 期待される利点

### ユーザビリティ
- 一度設定すれば永続的に使用可能
- OSネイティブのキーボードとして認識
- どのアプリケーションでも動作

### 技術的メリット
- 標準プロトコル使用で安定性高
- レイテンシー低
- バッテリー効率良好

### ビジネス価値
- Mac、Windows、Linux全対応
- 企業ユーザーにもアピール
- 技術的差別化要素

## 次のステップ

### 即座に必要な調査
1. **React Native HIDライブラリ**: 既存ライブラリ調査
2. **ネイティブ実装**: iOS HID実装方法
3. **キーコード**: 完全なマッピングテーブル

### 実装順序
1. HIDライブラリ調査・選定
2. ネイティブモジュール実装
3. キーボードレポート生成
4. UI統合・テスト

### 成功指標
- ペアリング成功率 > 95%
- 文字列送信成功率 > 99%
- レスポンス時間 < 100ms
- 対応OS: Mac/Windows/Linux