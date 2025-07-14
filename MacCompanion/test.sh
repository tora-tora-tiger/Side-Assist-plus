#!/bin/bash

echo "🧪 Testing Mac Companion App..."
echo ""

# Test build first
echo "📦 Building..."
if swift build; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting Mac Companion..."
    echo "💡 To test:"
    echo "1. Start iPad app and press 'Start Advertising'"
    echo "2. This will automatically connect"
    echo "3. Press 'Send ultradeepthink' on iPad"
    echo "4. Press Ctrl+C to stop this app"
    echo ""
    swift run MacCompanion
else
    echo "❌ Build failed!"
    exit 1
fi