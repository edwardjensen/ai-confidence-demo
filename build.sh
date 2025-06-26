#!/bin/bash

# Build script for Cloudflare Pages deployment
# This script replaces environment variable placeholders with actual values

set -e

echo "🔧 Building AI Confidence Demo for production..."

# Create build directory
mkdir -p dist

# Copy all files from public to dist
cp -r public/* dist/

# Replace API key placeholder in index.html
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "❌ Error: OPENROUTER_API_KEY environment variable is not set"
    exit 1
fi

echo "🔑 Injecting API key into build..."

# Replace the placeholder with the actual API key
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/%API_KEY%/$OPENROUTER_API_KEY/g" dist/index.html
else
    # Linux
    sed -i "s/%API_KEY%/$OPENROUTER_API_KEY/g" dist/index.html
fi

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
