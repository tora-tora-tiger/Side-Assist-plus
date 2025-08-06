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
    echo "  ./run.sh metro    # Expo Metro Bundler起動"
    echo "  ./run.sh ios      # Expo iOS側アプリセットアップ"
    echo "  ./run.sh android  # Expo Android側アプリセットアップ"
    echo ""
    echo "🎯 手順:"
    echo "  1. ./run.sh desktop     (ターミナル1) - サーバー機能付きデスクトップアプリ"
    echo "  2. ./run.sh ios         (ターミナル2) - Expo iOSビルド (開発サーバー自動起動)"
    echo "     または"
    echo "  2. ./run.sh android     (ターミナル2) - Android実機ビルド (開発サーバー自動起動)"
    echo "  3. 自動でビルド&実行"
    echo "  4. アプリでテスト"
    echo ""
    echo "📁 プロジェクト構造:"
    echo "  side-assist-desktop/   # Tauri v2 デスクトップアプリ (Rust + React)"
    echo "  side-assist-expo/      # Expo Router v5 モバイルアプリ"
    echo "  scripts/               # 分割されたスクリプト"
fi