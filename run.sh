#!/bin/bash

echo "🚀 Side Assist Plus - Mobile & Desktop"
echo "======================================="
echo ""

if [ "$1" == "desktop" ]; then
    ./scripts/desktop.sh
elif [ "$1" == "ios" ]; then
    ./scripts/ios.sh
elif [ "$1" == "android" ]; then
    ./scripts/android.sh
    
else
    echo "使用方法:"
    echo "  ./run.sh desktop  # Tauri デスクトップアプリ起動"
    echo "  ./run.sh ios      # Expo Go開発サーバー起動 (iOS)"
    echo "  ./run.sh android  # Expo Go開発サーバー起動 (Android)"
    echo ""
    echo "🎯 手順:"
    echo "  1. ./run.sh desktop     (ターミナル1) - サーバー機能付きデスクトップアプリ"
    echo "  2. ./run.sh ios         (ターミナル2) - Expo Go開発サーバー (QRコードスキャン)"
    echo "     または"
    echo "  2. ./run.sh android     (ターミナル2) - Expo Go開発サーバー (QRコードスキャン)"
    echo "  3. Expo GoアプリでQRコードスキャン"
    echo "  4. リアルタイムデバッグ開始"
    echo ""
    echo "📁 プロジェクト構造:"
    echo "  side-assist-desktop/   # Tauri v2 デスクトップアプリ (Rust + React)"
    echo "  side-assist-expo/      # Expo Router v5 モバイルアプリ"
    echo "  scripts/               # 分割されたスクリプト"
fi