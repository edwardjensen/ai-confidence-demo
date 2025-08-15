# Secure API Deployment with Cloudflare Pages

This project now uses Cloudflare Functions to securely handle API keys, preventing them from being exposed in client-side code.

## 🔒 Security Architecture

### Before (Insecure)
- API keys were injected into client-side JavaScript
- Keys were visible in browser developer tools
- Keys were exposed in the built HTML files

### After (Secure)
- API keys stored as Cloudflare environment variables
- Cloudflare Functions proxy API requests server-side
- Client-side code never sees the actual API keys
- Built-in rate limiting and request validation

## 🚀 Automated CI/CD Setup

### 1. GitHub Repository Secrets
In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `OPENROUTER_API_KEY_V2` - Your OpenRouter API key
- `OPENAI_EMBEDDINGS_API_KEY` - Your OpenAI API key for embeddings

### 2. Cloudflare API Token Setup
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" with these permissions:
   - **Zone**: `Zone:Read` (for all zones)
   - **Account**: `Cloudflare Pages:Edit` (for all accounts)
   - **Account**: `Account:Read` (for all accounts)

### 3. Automated Deployment Process
The GitHub Actions workflow will automatically:

```yaml
# On every push to main:
1. Build the project (npm run build)
2. Deploy to Cloudflare Pages
3. Configure environment variables securely
4. Deploy Cloudflare Functions from functions/ directory

# On pull requests:
1. Build and deploy preview
2. No environment variables (preview only)
```

### 4. Manual Environment Variable Deployment
You can also deploy environment variables manually:

```bash
# Using the dedicated workflow
gh workflow run deploy-env-vars.yml

# Or using Wrangler CLI locally
npm install -g wrangler
wrangler pages secret put OPENROUTER_API_KEY_V2 --project-name=ai-confidence-demo
```

## 🛠 API Endpoints

### `/api/chat` (POST)
Proxies OpenRouter chat completions for the confidence demo.

**Request:**
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [{"role": "user", "content": "Hello!"}],
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "choices": [...],
    "usage": {...}
  }
}
```

### `/api/embeddings` (POST)
Proxies OpenAI embeddings API for the embeddings demo.

**Request:**
```json
{
  "input": ["word1", "word2"],
  "model": "text-embedding-3-small",
  "dimensions": 1536
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [{"embedding": [...]}],
    "usage": {...}
  }
}
```

## 🔧 Built-in Security Features

### Rate Limiting
- Input length limits (10,000 characters for embeddings)
- Array size limits (50 items max for embeddings)
- Request validation and sanitization

### Error Handling
- Proper error responses without exposing internal details
- API key validation before making requests
- CORS headers for cross-origin requests

### Logging
- Server-side error logging
- No sensitive data logged
- Request monitoring capabilities

## 🧪 Testing

### Local Development
The local development server still works normally, but API calls will now go through the `/api/*` endpoints instead of directly to external APIs.

### Production Testing
1. Deploy to Cloudflare Pages
2. Set environment variables in Cloudflare dashboard
3. Test both confidence and embeddings demos
4. Verify API keys are not visible in browser dev tools

## 🚨 Migration Checklist

- [x] ✅ Created Cloudflare Functions for API proxying
- [x] ✅ Updated client-side code to use Functions endpoints
- [x] ✅ Removed API key injection from build process
- [x] ✅ Removed client-side API key management code
- [x] ✅ Created automated GitHub Actions workflows
- [x] ✅ Added local development API proxy endpoints
- [ ] ⏳ Configure GitHub repository secrets
- [ ] ⏳ Set up Cloudflare API token
- [ ] ⏳ Test automated deployment workflow
- [ ] ⏳ Verify production API security

## 📋 Verification Steps

After deployment, verify security by:

1. **Open browser dev tools** on your deployed site
2. **Check Network tab** - API calls should go to `/api/*` endpoints
3. **Check Sources/Application** - No API keys should be visible
4. **Test functionality** - Both demos should work normally
5. **Check Cloudflare logs** - Verify Functions are handling requests

Your API keys are now completely secure! 🔐