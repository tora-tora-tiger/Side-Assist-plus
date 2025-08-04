#!/bin/bash

echo "🚀 UltraDeepThink - iPhone実機版"
echo "=============================="
echo ""

if [ "$1" == "mac" ]; then
    echo "Mac サーバー起動..."
    cd MacCompanion
    ./start-mac.sh
elif [ "$1" == "metro" ]; then
    echo "Metro Bundler 起動..."
    
    if [ ! -d "UltraDeepThinkDemo" ]; then
        echo "❌ UltraDeepThinkDemo ディレクトリが見つかりません"
        exit 1
    fi
    
    cd UltraDeepThinkDemo
    
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
    
    if [ ! -d "UltraDeepThinkDemo" ]; then
        echo "❌ UltraDeepThinkDemo ディレクトリが見つかりません"
        exit 1
    fi
    
    cd UltraDeepThinkDemo
    
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
    open ios/UltraDeepThinkDemo.xcworkspace
    
    echo ""
    echo "✅ セットアップ完了！"
    echo ""
    echo "📋 次のステップ:"
    echo "   1. 別ターミナルで: ./run.sh metro"
    echo "   2. Xcodeでデバイス選択 → iPhone実機"
    echo "   3. Bundle ID変更: com.yourname.ultradeepthink"
    echo "   4. Team設定: 自分のApple ID"
    echo "   5. ▶️ でビルド&実行"
    
elif [ "$1" == "android" ]; then
    echo "Android アプリセットアップ..."
    
    if [ ! -d "UltraDeepThinkDemo" ]; then
        echo "❌ UltraDeepThinkDemo ディレクトリが見つかりません"
        exit 1
    fi
    
    cd UltraDeepThinkDemo
    
    # 依存関係チェック
    if [ ! -d "node_modules" ]; then
        echo "📦 依存関係インストール中..."
        npm install
    fi
    
    # Android Studio起動
    echo "🤖 Android Studio起動中..."
    open -a "Android Studio" android/
    
    echo ""
    echo "✅ セットアップ完了！"
    echo ""
    echo "📋 次のステップ:"
    echo "   1. 別ターミナルで: ./run.sh metro"
    echo "   2. Android Studioでプロジェクト開く"
    echo "   3. USB Debugging有効なAndroid実機を接続"
    echo "   4. デバイス選択 → Android実機"
    echo "   5. ▶️ Run 'app' でビルド&実行"
    echo ""
    echo "🔧 実機セットアップが必要な場合:"
    echo "   - 設定 → システム → 開発者向けオプション → USBデバッグ ON"
    echo "   - 設定 → セキュリティ → 提供元不明のアプリ ON"
    
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