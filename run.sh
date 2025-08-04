#!/bin/bash

echo "🚀 Side Assist Plus - Mobile & Desktop"
echo "======================================="
echo ""

if [ "$1" == "desktop" ]; then
    ./scripts/desktop.sh
elif [ "$1" == "metro" ]; then
    ./scripts/metro.sh
elif [ "$1" == "ios" ]; then
    ./scripts/ios.sh
elif [ "$1" == "android" ]; then
    ./scripts/android.sh
    
else
    echo "使用方法:"
    echo "  ./run.sh desktop  # Tauri デスクトップアプリ起動"
    echo "  ./run.sh metro    # Metro Bundler起動"
    echo "  ./run.sh ios      # iPhone側アプリセットアップ"
    echo "  ./run.sh android  # Android側アプリセットアップ"
    echo ""
    echo "🎯 手順:"
    echo "  1. ./run.sh desktop     (ターミナル1) - サーバー機能付きデスクトップアプリ"
    echo "  2. ./run.sh metro       (ターミナル2) - React Native開発サーバー"
    echo "  3. ./run.sh ios         (Xcode開く)"
    echo "     または"
    echo "  3. ./run.sh android     (Android実機ビルド)"
    echo "  4. 実機にビルド&実行"
    echo "  5. アプリでテスト"
    echo ""
    echo "📁 プロジェクト構造:"
    echo "  side-assist-desktop/   # Tauri v2 デスクトップアプリ (Rust + React)"
    echo "  side-assist-mobile/    # React Native モバイルアプリ"
    echo "  scripts/               # 分割されたスクリプト"
fi