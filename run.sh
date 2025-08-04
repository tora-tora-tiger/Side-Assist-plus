#!/bin/bash

echo "🚀 UltraDeepThink - iPhone実機版"
echo "=============================="
echo ""

if [ "$1" == "mac" ]; then
    echo "Mac サーバー起動..."
    cd MacCompanion
    ./start-mac.sh
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
        pnpm install
    fi
    
    if [ ! -d "ios/Pods" ]; then
        echo "🍎 iOS Pods インストール中..."
        cd ios && pod install && cd ..
    fi
    
    # Xcode開く
    echo "🚀 Xcode起動中..."
    open ios/UltraDeepThinkDemo.xcworkspace
    
    # Metro起動
    echo "📱 Metro bundler起動中..."
    pnpm start &
    METRO_PID=$!
    
    echo ""
    echo "✅ セットアップ完了！"
    echo ""
    echo "📋 次のステップ:"
    echo "   1. Xcodeでデバイス選択 → iPhone実機"
    echo "   2. Bundle ID変更: com.yourname.ultradeepthink"
    echo "   3. Team設定: 自分のApple ID"
    echo "   4. ▶️ でビルド&実行"
    echo ""
    echo "🛑 終了: kill $METRO_PID"
    
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
        pnpm install
    fi
    
    # Android Studio起動
    echo "🤖 Android Studio起動中..."
    open -a "Android Studio" android/
    
    # Metro起動
    echo "📱 Metro bundler起動中..."
    pnpm start &
    METRO_PID=$!
    
    echo ""
    echo "✅ セットアップ完了！"
    echo ""
    echo "📋 次のステップ:"
    echo "   1. Android Studioでプロジェクト開く"
    echo "   2. USB Debugging有効なAndroid実機を接続"
    echo "   3. デバイス選択 → Android実機"
    echo "   4. ▶️ Run 'app' でビルド&実行"
    echo ""
    echo "🔧 実機セットアップが必要な場合:"
    echo "   - 設定 → システム → 開発者向けオプション → USBデバッグ ON"
    echo "   - 設定 → セキュリティ → 提供元不明のアプリ ON"
    echo ""
    echo "🛑 終了: kill $METRO_PID"
    
else
    echo "使用方法:"
    echo "  ./run.sh mac      # Mac側サーバー起動"
    echo "  ./run.sh ios      # iPhone側アプリセットアップ"
    echo "  ./run.sh android  # Android側アプリセットアップ"
    echo ""
    echo "🎯 手順:"
    echo "  1. ./run.sh mac         (別ターミナル)"
    echo "  2. ./run.sh ios         (Xcode + Metro起動)"
    echo "     または"
    echo "  2. ./run.sh android     (Android Studio + Metro起動)"
    echo "  3. 実機にビルド&実行"
    echo "  4. アプリでテスト"
fi