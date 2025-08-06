#!/bin/bash

echo "Expo Android アプリセットアップ..."

if [ ! -d "side-assist-expo" ]; then
    echo "❌ side-assist-expo ディレクトリが見つかりません"
    exit 1
fi

cd side-assist-expo

# 依存関係チェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係インストール中..."
    pnpm install
fi

# Expo開発サーバーは自動起動されるため、Metro接続チェックは不要
echo "🚀 Expo開発サーバーは自動で起動されます"

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

# Expo Androidビルド&実行
echo "🚀 Expo Android実機でビルド&実行中..."
pnpm expo run:android

echo ""
echo "✅ Android セットアップ完了！"
echo ""
echo "📋 次のステップ:"
echo "   1. 🚀 Expo開発サーバー自動起動"
echo "   2. ✅ ADB転送設定済み (tcp:8081)"
echo "   3. ✅ Android実機にExpoアプリインストール済み"
echo "   4. アプリで権限許可を確認"
echo "   5. デスクトップサーバーに接続してテスト"
echo ""
echo "🔧 ビルドエラーの場合:"
echo "   - Android設定 → WiFi → 同じネットワーク確認"
echo "   - ./stop.sh → 再実行"