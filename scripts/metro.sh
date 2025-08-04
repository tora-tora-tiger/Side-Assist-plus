#!/bin/bash

echo "Metro Bundler 起動..."

if [ ! -d "side-assist-mobile" ]; then
    echo "❌ side-assist-mobile ディレクトリが見つかりません"
    exit 1
fi

cd side-assist-mobile

# 既存のMetroプロセス確認
EXISTING_PID=$(lsof -ti:8081 2>/dev/null)
if [ ! -z "$EXISTING_PID" ]; then
    echo "⚠️  ポート8081が使用中です (PID: $EXISTING_PID)"
    echo "🛑 既存のMetroを終了しますか？ (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        kill -9 $EXISTING_PID
        echo "✅ 既存のMetroを終了しました"
    else
        echo "❌ Metro起動をキャンセルしました"
        exit 1
    fi
fi

# 依存関係チェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係インストール中..."
    npm install
fi

echo "📱 Metro bundler起動中..."
npm start