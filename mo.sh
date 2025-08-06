#!/bin/bash

echo "Expo Go開発サーバー起動..."

if [ ! -d "side-assist-expo" ]; then
    echo "❌ side-assist-expo ディレクトリが見つかりません"
    exit 1
fi

cd side-assist-expo

# 依存関係チェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係インストール中..."
    npm install
fi

echo "📱 スマホ Expo Go接続手順:"
echo "   1. ✅ App Store/Google PlayからExpo Goアプリをインストール済み"
echo "   2. 📶 Macとスマホが同じWiFiネットワークに接続"
echo "   3. 🔄 以下QRコードをExpo Goアプリでスキャン"
echo "   4. ⚡ リアルタイム更新でデバッグ可能"
echo ""
echo "   💡 Side Assistデスクトップアプリは別ターミナルで ./pc.sh で起動"
echo ""

# Expo開発サーバー起動
echo "🚀 Expo Go開発サーバー起動中..."
npx expo start

echo ""
echo "✅ 開発サーバー終了！"
echo ""
echo "💡 再起動する場合:"
echo "   ./mo.sh"