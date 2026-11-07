#!/bin/bash

# build-android.sh
# Script to build Next.js statically for Capacitor while keeping backend API routes intact.

echo "🚀 Preparing Android Static Build..."

# 1. Temporarily move the API folder so Next.js doesn't complain during static export
if [ -d "app/api" ]; then
    echo "📦 Stashing API routes..."
    mv app/api ./api_backup
fi

# 2. Build the static UI bundle
echo "🔨 Building static Next.js bundle..."
npm run build
BUILD_STATUS=$?

# 3. Restore the API folder
if [ -d "./api_backup" ]; then
    echo "♻️ Restoring API routes..."
    mv ./api_backup app/api
fi

# 4. If build succeeded, sync with Capacitor
if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Build successful! Syncing to Capacitor Android..."
    npx cap sync android
    echo "🎉 Done! You can now run './gradlew assembleDebug' in the android folder or open Android Studio."
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
