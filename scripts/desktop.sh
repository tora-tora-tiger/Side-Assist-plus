#!/bin/bash

echo "🖥️  Tauri Desktop アプリ起動..."
cd side-assist-desktop

# 依存関係チェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係インストール中..."
    pnpm install
    if [ $? -ne 0 ]; then
        echo "❌ 依存関係のインストールに失敗しました"
        exit 1
    fi
fi

# ポート競合チェック
echo "🔗 ポート競合チェック中..."
VITE_PORT_PIDS=$(lsof -ti:1420 2>/dev/null)
if [ ! -z "$VITE_PORT_PIDS" ]; then
    echo "⚠️  ポート1420が使用中です (PID: $VITE_PORT_PIDS)"
    echo "🛑 既存のプロセスを終了しますか？ (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo $VITE_PORT_PIDS | xargs kill -TERM 2>/dev/null
        sleep 2
        # 強制終了が必要な場合
        REMAINING_PIDS=$(lsof -ti:1420 2>/dev/null)
        if [ ! -z "$REMAINING_PIDS" ]; then
            echo $REMAINING_PIDS | xargs kill -9 2>/dev/null
        fi
        echo "✅ 既存のプロセスを終了しました"
    else
        echo "❌ Tauri起動をキャンセルしました"
        exit 1
    fi
fi

TAURI_PORT_PIDS=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$TAURI_PORT_PIDS" ]; then
    echo "⚠️  ポート8080が使用中です (PID: $TAURI_PORT_PIDS)"
    echo "🛑 既存のサーバーを終了しますか？ (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo $TAURI_PORT_PIDS | xargs kill -9 2>/dev/null
        echo "✅ 既存のサーバーを終了しました"
    else
        echo "❌ Tauri起動をキャンセルしました"
        exit 1
    fi
fi

# ネットワーク権限情報 (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 権限について:"
    echo "   起動後にアクセシビリティ・ネットワーク接続許可が表示されます"
    echo "   アプリ内で権限ガイドを確認してください"
    echo ""
fi

echo "🚀 Tauri デスクトップアプリ起動中..."
echo "   - フロントエンド: http://localhost:1420"
echo "   - サーバー: http://localhost:8080"
echo ""
echo "⏳ 起動完了まで10-15秒お待ちください..."
echo ""

# Tauri起動
pnpm tauri dev

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Tauri起動に失敗しました"
    echo ""
    echo "🔧 トラブルシューティング:"
    echo "   1. 依存関係を再インストール: cd side-assist-desktop && pnpm install"
    echo "   2. キャッシュクリア: pnpm tauri clean"
    echo "   3. Rustツールチェーン確認: rustc --version"
    echo "   4. ./stop.sh で全プロセス終了後に再試行"
    exit 1
fi