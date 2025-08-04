#!/bin/bash

echo "Android アプリセットアップ..."

if [ ! -d "side-assist-mobile" ]; then
    echo "❌ side-assist-mobile ディレクトリが見つかりません"
    exit 1
fi

cd side-assist-mobile

# 依存関係チェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係インストール中..."
    npm install
fi

# Metro接続確認
echo "🔗 Metro Bundler接続確認中..."
if ! curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "⚠️  Metro Bundlerが起動していません"
    echo "📋 先に以下を実行してください:"
    echo "   ./run.sh metro"
    echo ""
    echo "❌ Android セットアップを中止します"
    exit 1
else
    echo "✅ Metro Bundler接続OK"
fi

# Android実機接続確認
echo "📱 Android実機接続確認中..."
DEVICE_COUNT=$(adb devices | grep -v "List of devices" | grep "device" | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -eq "0" ]; then
    echo "❌ Android実機が接続されていません"
    echo "🔧 以下を確認してください:"
    echo "   - USB接続"
    echo "   - USBデバッグ有効"
    echo "   - adb devices でデバイス表示"
    exit 1
fi

# Android権限チェック説明
echo "📱 Android権限設定について:"
echo "   アプリ初回起動時に以下の権限許可が必要です:"
echo "   1. 📶 ネットワーク使用許可 → 「許可」を選択"
echo "   2. 🔍 ローカルネットワークアクセス → 「許可」を選択"
echo ""
echo "   ⚠️  権限を拒否すると、デスクトップサーバーに接続できません"
echo ""

# ADBポート転送設定
echo "🔗 ADB ポート転送設定中..."
adb reverse tcp:8081 tcp:8081

# Androidビルド&実行
echo "🚀 Android実機でビルド&実行中..."
npm run android

echo ""
echo "✅ Android セットアップ完了！"
echo ""
echo "📋 次のステップ:"
echo "   1. ✅ Metro起動済み (http://localhost:8081)"
echo "   2. ✅ ADB転送設定済み (tcp:8081)"
echo "   3. ✅ Android実機にアプリインストール済み"
echo "   4. アプリで権限許可を確認"
echo "   5. デスクトップサーバーに接続してテスト"
echo ""
echo "🔧 Metro接続エラーの場合:"
echo "   - Android設定 → WiFi → 同じネットワーク確認"
echo "   - ./stop.sh → ./run.sh metro → 再実行"