#!/bin/bash

echo "Expo iPhone アプリセットアップ..."

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

if [ ! -d "ios/Pods" ]; then
    echo "🍎 iOS Pods インストール中..."
    cd ios && pod install && cd ..
fi

# iOS権限チェック説明
echo "📱 iOS権限設定について:"
echo "   アプリ初回起動時に以下の権限許可が必要です:"
echo "   1. 📶 ローカルネットワーク使用許可 → 「許可」を選択"
echo "   2. 🔍 ネットワークスキャン許可 → 「許可」を選択"
echo ""
echo "   ⚠️  権限を拒否すると、Macサーバーに接続できません"
echo ""

# Expo開発サーバーは自動起動されるため、Metro接続チェックは不要
echo "🚀 Expo開発サーバーは自動で起動されます"

# Expo iOSビルド実行 (実機指定)
echo "🚀 Expo iOS ビルド実行中..."

# 環境変数からデバイス名を取得
if [ -f ".env" ]; then
    DEVICE_NAME=$(grep "EXPO_PUBLIC_DEVICE_NAME" .env | cut -d '"' -f 2)
    if [ ! -z "$DEVICE_NAME" ] && [ "$DEVICE_NAME" != "" ]; then
        echo "📱 指定デバイス: $DEVICE_NAME"
        pnpm expo run:ios --device "$DEVICE_NAME"
    else
        echo "📱 実機を自動検出中..."
        pnpm expo run:ios --device
    fi
else
    echo "📱 実機を自動検出中..."
    pnpm expo run:ios --device
fi

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "📋 次のステップ:"
echo "   1. 🚀 Expo開発サーバー自動起動"
echo "   2. 自動的にXcodeでビルド&実機にインストール"
echo "   3. iPhoneでアプリ確認"
echo "   4. 権限許可: ローカルネットワーク → 許可"
echo "   5. デスクトップアプリとの接続テスト"
echo ""
echo "🔧 ビルドエラーの場合:"
echo "   - iPhone設定 → WiFi → 同じネットワーク確認"
echo "   - ./stop.sh → 再実行"
echo ""
echo "💡 手動でXcodeを使う場合:"
echo "   - open ios/sideassistexpo.xcworkspace"
echo "   - Bundle ID変更: com.yourname.sideassistexpo"
echo "   - Team設定: 自分のApple ID"