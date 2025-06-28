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

# Process build info if available
if [ -f "build-data/buildinfo.yml" ]; then
    echo "📋 Injecting build information..."
    
    # Read build info values
    COMMIT=$(grep "^commit:" build-data/buildinfo.yml | cut -d' ' -f2)
    BUILD_ID=$(grep "^build_id:" build-data/buildinfo.yml | cut -d' ' -f2)
    BUILD_URL=$(grep "^build_url:" build-data/buildinfo.yml | cut -d' ' -f2-)
    TIMESTAMP=$(grep "^timestamp:" build-data/buildinfo.yml | cut -d' ' -f2-)
    
    # Replace build info placeholders
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|%BUILD_COMMIT%|${COMMIT}|g" dist/index.html
        sed -i '' "s|%BUILD_ID%|${BUILD_ID}|g" dist/index.html
        sed -i '' "s|%BUILD_URL%|${BUILD_URL}|g" dist/index.html
        sed -i '' "s|%BUILD_TIMESTAMP%|${TIMESTAMP}|g" dist/index.html
    else
        # Linux
        sed -i "s|%BUILD_COMMIT%|${COMMIT}|g" dist/index.html
        sed -i "s|%BUILD_ID%|${BUILD_ID}|g" dist/index.html
        sed -i "s|%BUILD_URL%|${BUILD_URL}|g" dist/index.html
        sed -i "s|%BUILD_TIMESTAMP%|${TIMESTAMP}|g" dist/index.html
    fi
else
    echo "⚠️  No build info found, using fallback values..."
    # Replace with fallback values for local development
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|%BUILD_COMMIT%|local-dev|g" dist/index.html
        sed -i '' "s|%BUILD_ID%|local|g" dist/index.html
        sed -i '' "s|%BUILD_URL%|#|g" dist/index.html
        sed -i '' "s|%BUILD_TIMESTAMP%|$(date -u '+%Y-%m-%d %H:%M:%S UTC')|g" dist/index.html
    else
        # Linux
        sed -i "s|%BUILD_COMMIT%|local-dev|g" dist/index.html
        sed -i "s|%BUILD_ID%|local|g" dist/index.html
        sed -i "s|%BUILD_URL%|#|g" dist/index.html
        sed -i "s|%BUILD_TIMESTAMP%|$(date -u '+%Y-%m-%d %H:%M:%S UTC')|g" dist/index.html
    fi
fi

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
