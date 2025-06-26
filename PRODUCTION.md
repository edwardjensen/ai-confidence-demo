# AI Confidence Demo - Production Deployment Guide

This document explains how to set up and deploy the AI Confidence Demo to Cloudflare Pages with automated publishing and unpublishing workflows.

## Overview

The production deployment includes:

- **Static site deployment** to Cloudflare Pages
- **Automated publishing** via GitHub Actions (manual trigger)
- **Automated unpublishing** via GitHub Actions (daily at 07:00 UTC)
- **Pre-configured API key** injected during build process
- **Parallel operation** with the local development version

## Prerequisites

1. **Cloudflare Account** with Pages enabled
2. **GitHub Repository** with Actions enabled
3. **OpenRouter API Key** for AI functionality

## Setup Instructions

### 1. Cloudflare Pages Project Setup

1. Log into your Cloudflare dashboard
2. Go to **Pages** > **Create a project**
3. Connect your GitHub repository
4. Set the project name (you'll need this for secrets)
5. Configure build settings:
   - **Build command**: `./build.sh`
   - **Build output directory**: `dist`
   - **Environment variables**: Leave empty (handled by GitHub Actions)

### 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | `sk-or-v1-xxx...` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages permissions | `xxx...` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | `xxx...` |
| `CLOUDFLARE_PROJECT_NAME` | Your Cloudflare Pages project name | `ai-confidence-demo` |

#### Creating a Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Custom token** template
4. Set permissions:
   - **Zone:Zone:Read** (for your domain)
   - **Zone:Page Rule:Edit** (for your domain)  
   - **Account:Cloudflare Pages:Edit**
5. Set account resources to include your account
6. Click **Continue to summary** and **Create Token**

### 3. Deployment Workflows

#### Publishing (Manual Trigger)

To deploy the site:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Cloudflare Pages** workflow
3. Click **Run workflow**
4. Choose environment (production/staging)
5. Click **Run workflow**

The workflow will:
- Build the application with your API key
- Deploy to Cloudflare Pages
- Create a deployment summary
- Add a commit comment

#### Unpublishing (Automated Daily)

The site automatically unpublishes daily at 07:00 UTC via the **Unpublish from Cloudflare Pages** workflow.

You can also manually unpublish:

1. Go to **Actions** tab in your GitHub repository
2. Select **Unpublish from Cloudflare Pages** workflow  
3. Click **Run workflow**
4. Type "confirm" in the confirmation field
5. Click **Run workflow**

## File Structure

```
├── public/                    # Production-ready files
│   ├── index.html            # Production HTML (no API key input)
│   ├── script.js             # Enhanced JS with production mode
│   └── styles.css            # Styles with production enhancements
├── .github/workflows/
│   ├── deploy.yml            # Publishing workflow
│   └── unpublish.yml         # Unpublishing workflow
├── build.sh                  # Build script for production
├── _headers                  # Cloudflare Pages configuration
├── logprobs.html             # Local development version
├── script.js                 # Local development script
├── styles.css                # Local development styles
└── server.js                 # Local development server
```

## Production vs Local Differences

### Local Development
- Requires manual API key input
- Runs on Express server
- Uses `logprobs.html`
- Full server setup with port detection

### Production Deployment
- API key pre-configured from environment
- Static files served by Cloudflare Pages
- Uses `public/index.html`
- No server required

## Monitoring and Maintenance

### Deployment Status
- Check the **Actions** tab for workflow runs
- Review deployment summaries in workflow outputs
- Monitor Cloudflare Pages dashboard for site status

### Daily Unpublishing
- Automatic unpublishing creates a GitHub issue notification
- Check **Issues** tab for unpublish notifications
- Review unpublish summaries in workflow outputs

### Security Considerations
- API key is injected at build time and not exposed in source code
- Cloudflare Pages provides security headers automatically
- Site automatically unpublishes daily to limit exposure

## Troubleshooting

### Build Failures
- Verify all GitHub secrets are set correctly
- Check that `OPENROUTER_API_KEY` is valid
- Ensure build script has execute permissions

### Deployment Issues
- Verify Cloudflare API token has correct permissions
- Check that account ID and project name are correct
- Review Cloudflare Pages logs in dashboard

### API Issues
- Verify OpenRouter API key is active and has credits
- Check API key format (should start with `sk-or-v1-`)
- Review network connectivity to OpenRouter API

## Support

For issues with:
- **Local development**: Check the main README.md
- **Production deployment**: Review this guide and GitHub Actions logs
- **API functionality**: Consult OpenRouter documentation
- **Cloudflare Pages**: Check Cloudflare Pages documentation
