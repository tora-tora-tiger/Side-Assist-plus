#!/bin/bash

echo "🚀 Side Assist - Mobile & Desktop"
echo "=============================="
echo ""

if [ "$1" == "mac" ]; then
    echo "Mac サーバー起動..."
    cd side-assist-server
    ./start-mac.sh
elif [ "$1" == "metro" ]; then
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
    
elif [ "$1" == "ios" ]; then
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
    
    # Xcode開く
    echo "🚀 Xcode起動中..."
    open ios/SideAssist.xcworkspace
    
    echo ""
    echo "✅ セットアップ完了！"
    echo ""
    echo "📋 次のステップ:"
    echo "   1. 別ターミナルで: ./run.sh metro"
    echo "   2. Xcodeでデバイス選択 → iPhone実機"
    echo "   3. Bundle ID変更: com.yourname.sideassist"
    echo "   4. Team設定: 自分のApple ID"
    echo "   5. ▶️ でビルド&実行"
    
elif [ "$1" == "android" ]; then
    echo "Android アプリ完全自動セットアップ..."
    
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
    
    # 既存プロセス終了
    echo "🛑 既存のMetroプロセスを終了中..."
    EXISTING_PIDS=$(lsof -ti:8081 2>/dev/null)
    if [ ! -z "$EXISTING_PIDS" ]; then
        echo $EXISTING_PIDS | xargs kill -9 2>/dev/null
        sleep 1
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
    
    # ADBポート転送設定
    echo "🔗 ADB ポート転送設定中..."
    adb reverse tcp:8081 tcp:8081
    
    # Metro Bundler起動 (バックグラウンド)
    echo "📱 Metro Bundler起動中..."
    npx react-native start --reset-cache &
    METRO_PID=$!
    
    # Metro起動待機
    echo "⏳ Metro起動を待機中..."
    sleep 5
    
    # Metro接続確認
    for i in {1..10}; do
        if curl -s http://localhost:8081/status > /dev/null 2>&1; then
            echo "✅ Metro起動完了"
            break
        fi
        echo "   Metro起動中... ($i/10)"
        sleep 2
    done
    
    # Androidビルド&実行
    echo "🚀 Android実機でビルド&実行中..."
    npm run android
    
    echo ""
    echo "✅ Android完全自動セットアップ完了！"
    echo ""
    echo "📋 実行中のプロセス:"
    echo "   Metro PID: $METRO_PID"
    echo "   ADB転送: tcp:8081 -> tcp:8081"
    echo ""
    echo "🛑 終了方法:"
    echo "   kill $METRO_PID"
    echo "   または Ctrl+C でスクリプト終了"
    
    # PIDをファイルに保存
    echo $METRO_PID > .metro.pid
    
    # 終了シグナル処理
    trap "kill $METRO_PID 2>/dev/null; rm -f .metro.pid; exit" INT TERM
    
    # スクリプト継続 (Metro監視)
    wait $METRO_PID
    
else
    echo "使用方法:"
    echo "  ./run.sh mac      # Mac側サーバー起動"
    echo "  ./run.sh metro    # Metro Bundler起動"
    echo "  ./run.sh ios      # iPhone側アプリセットアップ"
    echo "  ./run.sh android  # Android側アプリセットアップ"
    echo ""
    echo "🎯 手順:"
    echo "  1. ./run.sh mac         (ターミナル1)"
    echo "  2. ./run.sh metro       (ターミナル2)"
    echo "  3. ./run.sh ios         (Xcode開く)"
    echo "     または"
    echo "  3. ./run.sh android     (Android Studio開く)"
    echo "  4. 実機にビルド&実行"
    echo "  5. アプリでテスト"
fi