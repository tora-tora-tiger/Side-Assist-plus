# 超シンプルな使用方法

## 現在の制限

**重要：** MacBook側に特別な設定なしで文字入力するには、以下のいずれかが必要です：

### 方法1: Bluetooth キーボードとしてペアリング（推奨）
1. iPad設定 → Bluetooth でMacを検索
2. Macの「システム設定」→「Bluetooth」でiPadをキーボードとして追加
3. 一度ペアリングすれば、アプリから直接文字入力可能

### 方法2: ネットワーク経由（最もシンプル）
- BLEではなくWiFi経由でMacにコマンド送信
- MacでSimple HTTP serverを起動
- アプリからHTTP POSTで文字列送信

### 方法3: AirDrop風の仕組み
- MultipeerConnectivityフレームワーク使用
- WiFi/Bluetooth自動検出
- 設定不要で近くのMacに送信

## 現状のBLEアプローチの問題

Mac側がBLEペリフェラル（受信側）になるには：
- 専用アプリが必要
- 開発者による事前設定が必要
- 「設定不要」という要件に合わない

## 推奨解決策

**最もシンプル：** ネットワーク経由でMacのサーバーに送信
- Mac: `python -m http.server 8080` だけで準備完了
- iPad: HTTP POSTで文字列送信
- 設定ほぼ不要、確実に動作