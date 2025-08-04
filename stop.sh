#!/bin/bash

echo "🛑 Side Assist Plus プロセス終了中..."

# Tauri Desktop アプリ終了 (新構成)
echo "🖥️  Tauri Desktop アプリ終了中..."

# Tauriプロセス終了 (複数パターン対応)
TAURI_PIDS=$(ps aux | grep -E "tauri dev|cargo.*tauri|side-assist-desktop" | grep -v grep | awk '{print $2}')
if [ ! -z "$TAURI_PIDS" ]; then
    echo "   Tauriプロセス終了中... (PID: $TAURI_PIDS)"
    echo $TAURI_PIDS | xargs kill -TERM 2>/dev/null
    sleep 3
    
    # 強制終了が必要な場合
    REMAINING_PIDS=$(ps aux | grep -E "tauri dev|cargo.*tauri|side-assist-desktop" | grep -v grep | awk '{print $2}')
    if [ ! -z "$REMAINING_PIDS" ]; then
        echo "   強制終了中... (PID: $REMAINING_PIDS)"
        echo $REMAINING_PIDS | xargs kill -9 2>/dev/null
        sleep 1
    fi
    echo "   ✅ Tauri Desktop終了完了"
else
    echo "   Tauri Desktop は実行されていません"
fi

# Viteプロセス終了 (ポート1420)
VITE_PIDS=$(lsof -ti:1420 2>/dev/null)
if [ ! -z "$VITE_PIDS" ]; then
    echo "   Viteサーバー終了中... (PID: $VITE_PIDS)"
    echo $VITE_PIDS | xargs kill -TERM 2>/dev/null
    sleep 2
    # 強制終了が必要な場合
    REMAINING_VITE_PIDS=$(lsof -ti:1420 2>/dev/null)
    if [ ! -z "$REMAINING_VITE_PIDS" ]; then
        echo $REMAINING_VITE_PIDS | xargs kill -9 2>/dev/null
    fi
    echo "   ✅ Viteサーバー終了完了"
fi

# ポート8080で動作中のサーバー終了 (Tauri/Swift両方)
DESKTOP_SERVER_PIDS=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$DESKTOP_SERVER_PIDS" ]; then
    echo $DESKTOP_SERVER_PIDS | xargs kill -9 2>/dev/null
    echo "   Desktop サーバー (8080) 終了完了"
fi

# Metro Bundler 終了
echo "📱 Metro Bundler終了中..."
METRO_PIDS=$(lsof -ti:8081 2>/dev/null)
if [ ! -z "$METRO_PIDS" ]; then
    echo $METRO_PIDS | xargs kill -9 2>/dev/null
    echo "   Metro終了完了"
else
    echo "   Metro は実行されていません"
fi

# 保存されたPIDファイルから終了
if [ -f "side-assist-mobile/.metro.pid" ]; then
    SAVED_PID=$(cat side-assist-mobile/.metro.pid)
    kill $SAVED_PID 2>/dev/null
    rm -f side-assist-mobile/.metro.pid
    echo "   PIDファイルから Metro終了: $SAVED_PID"
fi

# Mac サーバー終了 (レガシー)
echo "🍎 Mac サーバー終了中 (レガシー)..."
MAC_LEGACY_PIDS=$(ps aux | grep "swift run\|MacCompanion" | grep -v grep | awk '{print $2}')
if [ ! -z "$MAC_LEGACY_PIDS" ]; then
    echo $MAC_LEGACY_PIDS | xargs kill -9 2>/dev/null
    echo "   Mac サーバー (レガシー) 終了完了"
else
    echo "   Mac サーバー (レガシー) は実行されていません"
fi

# ADB転送削除
echo "🔗 ADB転送削除中..."
adb reverse --remove tcp:8081 2>/dev/null
echo "   ADB転送削除完了"

echo ""
echo "✅ 全プロセス終了完了！"
echo ""
echo "📁 プロジェクト構造:"
echo "  side-assist-desktop/   # Tauri v2 デスクトップアプリ (推奨)"
echo "  side-assist-mobile/    # React Native モバイルアプリ"
echo "  side-assist-server/    # Swift サーバー (レガシー)"
echo ""
echo "🚀 再起動方法:"
echo "  ./run.sh desktop   # Tauri デスクトップアプリ (推奨)"
echo "  ./run.sh mac       # Swift サーバー (レガシー)"