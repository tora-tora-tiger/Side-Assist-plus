#!/bin/bash

# Side Assist Server - Auto Setup Script
# This script automatically sets up and runs the Mac HTTP server for mobile communication

echo "🚀 Side Assist Server - Auto Setup"
echo "=========================================="
echo ""

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"
echo ""

# Check if Swift is available
echo "🔍 Checking Swift installation..."
if ! command -v swift &> /dev/null; then
    echo "❌ Swift is not installed or not in PATH"
    echo "💡 Please install Xcode or Swift toolchain:"
    echo "   https://developer.apple.com/xcode/"
    exit 1
fi

SWIFT_VERSION=$(swift --version | head -n1)
echo "✅ Found Swift: $SWIFT_VERSION"
echo ""

# Check for required Swift files
echo "🔍 Checking required files..."
if [ ! -f "http-server.swift" ]; then
    echo "❌ http-server.swift not found"
    echo "💡 Make sure you're running this from the side-assist-server directory"
    exit 1
fi
echo "✅ All required files found"
echo ""

# Get local IP address
echo "🌐 Getting local IP address..."
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi
echo "📍 Mac IP address: $LOCAL_IP"
echo ""

# Check if port 8080 is already in use
echo "🔍 Checking port 8080..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 8080 is already in use"
    echo "🛑 Killing existing process..."
    sudo lsof -ti:8080 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi
echo "✅ Port 8080 is available"
echo ""

# Request accessibility permissions
echo "🔐 Checking accessibility permissions..."
echo "⚠️  IMPORTANT: This app needs accessibility permissions to simulate keyboard input"
echo ""
echo "📋 If prompted, please:"
echo "   1. Go to System Preferences → Security & Privacy → Privacy → Accessibility"
echo "   2. Click the lock icon and enter your password"
echo "   3. Add Terminal (or your terminal app) to the list"
echo "   4. Make sure it's checked/enabled"
echo ""
echo "Press ENTER when ready to continue..."
read -r

echo "🚀 Starting HTTP Keyboard Server..."
echo "📱 Mobile should connect to: http://$LOCAL_IP:8080"
echo "🎯 Server will auto-type when mobile sends messages"
echo ""
echo "📖 Instructions:"
echo "   1. Keep this terminal window open"
echo "   2. On Mobile: Start the Side Assist app"
echo "   3. On Mobile: Press the 'ultradeepthink' button"
echo "   4. Watch the magic happen! ✨"
echo "   5. Watch the magic happen! ✨"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""
echo "==========================================="
echo ""

# Run the server
swift http-server.swift