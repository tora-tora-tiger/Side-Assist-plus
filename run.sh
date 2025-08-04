#!/bin/bash

echo "🚀 Side Assist Plus - Mobile & Desktop"
echo "======================================="
echo ""

if [ "$1" == "desktop" ]; then
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
    
    # システム権限チェック (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🔐 システム権限チェック中..."
        
        # アクセシビリティ権限チェック
        ACCESSIBILITY_CHECK=$(sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db "SELECT allowed FROM access WHERE service='kTCCServiceAccessibility' AND client LIKE '%Terminal%' OR client LIKE '%iTerm%' OR client LIKE '%Code%'" 2>/dev/null | grep 1 | wc -l | tr -d ' ')
        
        if [ "$ACCESSIBILITY_CHECK" -eq "0" ]; then
            echo "⚠️  アクセシビリティ権限が必要です"
            echo ""
            echo "📋 権限設定手順:"
            echo "   1. システム環境設定 → プライバシーとセキュリティ"
            echo "   2. アクセシビリティ"
            echo "   3. ＋ボタンでターミナルアプリを追加"
            echo "   4. チェックボックスにチェック"
            echo ""
            echo "🚀 権限設定後、再度 ./run.sh desktop を実行してください"
            exit 1
        else
            echo "✅ アクセシビリティ権限OK"
        fi
        
        echo "🌐 ネットワーク権限について:"
        echo "   起動後にネットワーク接続許可ダイアログが表示されます"
        echo "   「許可」を選択してください (HTTP サーバー: localhost:8080)"
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

elif [ "$1" == "mac" ]; then
    echo "🍎 Mac サーバー起動 (レガシー)..."
    echo "⚠️  推奨: ./run.sh desktop を使用してください"
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
    echo "  ./run.sh desktop  # Tauri デスクトップアプリ起動 (推奨)"
    echo "  ./run.sh mac      # Mac側サーバー起動 (レガシー)"
    echo "  ./run.sh metro    # Metro Bundler起動"
    echo "  ./run.sh ios      # iPhone側アプリセットアップ"
    echo "  ./run.sh android  # Android側アプリセットアップ"
    echo ""
    echo "🎯 手順 (新構成):"
    echo "  1. ./run.sh desktop     (ターミナル1) - サーバー機能付きデスクトップアプリ"
    echo "  2. ./run.sh metro       (ターミナル2) - React Native開発サーバー"
    echo "  3. ./run.sh ios         (Xcode開く)"
    echo "     または"
    echo "  3. ./run.sh android     (Android Studio開く)"
    echo "  4. 実機にビルド&実行"
    echo "  5. アプリでテスト"
    echo ""
    echo "📁 プロジェクト構造:"
    echo "  side-assist-desktop/   # Tauri v2 デスクトップアプリ (Rust + React)"
    echo "  side-assist-mobile/    # React Native モバイルアプリ"
    echo "  side-assist-server/    # Swift サーバー (レガシー)"
fi