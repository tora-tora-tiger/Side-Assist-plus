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
    
else
    echo "使用方法:"
    echo "  ./run.sh mac    # Mac側サーバー起動"
    echo "  ./run.sh ios    # iPhone側アプリセットアップ"
    echo ""
    echo "🎯 手順:"
    echo "  1. ./run.sh mac    (別ターミナル)"
    echo "  2. ./run.sh ios    (Xcode + Metro起動)"
    echo "  3. XcodeでiPhone実機にビルド"
    echo "  4. iPhoneアプリでテスト"
fi