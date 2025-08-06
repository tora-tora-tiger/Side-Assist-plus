#!/bin/bash

echo "Expo Metro Bundler 起動..."

if [ ! -d "side-assist-expo" ]; then
    echo "❌ side-assist-expo ディレクトリが見つかりません"
    exit 1
fi

cd side-assist-expo

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
    pnpm install
fi

echo "📱 Expo Metro bundler起動中..."
pnpm expo start