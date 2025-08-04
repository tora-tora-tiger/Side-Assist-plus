#!/bin/bash

echo "iPhone アプリセットアップ..."

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

# Metro接続確認
echo "🔗 Metro Bundler接続確認中..."
if ! curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "⚠️  Metro Bundlerが起動していません"
    echo "📋 先に以下を実行してください:"
    echo "   ./run.sh metro"
    echo ""
    echo "❌ iOS セットアップを中止します"
    exit 1
else
    echo "✅ Metro Bundler接続OK"
fi

# Xcode開く
echo "🚀 Xcode起動中..."
open ios/SideAssist.xcworkspace

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "📋 次のステップ:"
echo "   1. ✅ Metro起動済み (http://localhost:8081)"
echo "   2. Xcodeでデバイス選択 → iPhone実機"
echo "   3. Bundle ID変更: com.yourname.sideassist"
echo "   4. Team設定: 自分のApple ID"
echo "   5. ▶️ でビルド&実行"
echo ""
echo "🔧 Metro接続エラーの場合:"
echo "   - iPhone設定 → WiFi → 同じネットワーク確認"
echo "   - ./stop.sh → ./run.sh metro → 再実行"