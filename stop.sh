#!/bin/bash

echo "🛑 UltraDeepThink プロセス終了中..."

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
if [ -f "UltraDeepThinkDemo/.metro.pid" ]; then
    SAVED_PID=$(cat UltraDeepThinkDemo/.metro.pid)
    kill $SAVED_PID 2>/dev/null
    rm -f UltraDeepThinkDemo/.metro.pid
    echo "   PIDファイルから Metro終了: $SAVED_PID"
fi

# Mac サーバー終了
echo "🖥️  Mac サーバー終了中..."
MAC_PIDS=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$MAC_PIDS" ]; then
    echo $MAC_PIDS | xargs kill -9 2>/dev/null
    echo "   Mac サーバー終了完了"
else
    echo "   Mac サーバーは実行されていません"
fi

# ADB転送削除
echo "🔗 ADB転送削除中..."
adb reverse --remove tcp:8081 2>/dev/null
echo "   ADB転送削除完了"

echo ""
echo "✅ 全プロセス終了完了！"