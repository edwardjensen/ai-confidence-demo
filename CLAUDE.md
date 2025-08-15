# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` or `npm run dev` - Start development server (automatically finds available port 8000-8010 and opens browser)
- `npm run serve` - Build and serve (runs build.sh then starts server)
- `npm run preview` - Start server without building

### Build & Deploy
- `./build.sh` - Build for production (creates dist/ folder with environment variable injection)
- `npm run build` - Same as ./build.sh

## Project Architecture

This is an AI confidence visualization tool that demonstrates token-level confidence scores using OpenRouter API with log probabilities.

### Key Components

**Frontend Structure:**
- `public/` - Source files for development
  - `index.html` - Main application with environment variable placeholders (%API_KEY%, %IS_PRODUCTION%)
  - `script.js` - Client-side JavaScript handling OpenRouter API calls, confidence visualization, and markdown parsing
  - `assets/styles.css` - CSS styling
- `dist/` - Built files for production (created by build.sh)
- Root `index.html` - Smart redirect that tries dist/ then public/

**Backend:**
- `server.js` - Express server for local development
  - Serves static files from dist/
  - Provides /api/config endpoint for API key retrieval from environment
  - Auto-detects available ports (8000-8010)
  - Opens browser automatically

### Build Process

The build system handles two deployment modes:

1. **Local Development**: Uses server.js with optional .env.local file for API key
2. **Production**: Uses build.sh to inject environment variables into static files for Cloudflare Pages

Build script (`build.sh`):
- Copies public/ → dist/
- Replaces %API_KEY% placeholder with OPENROUTER_API_KEY environment variable
- Replaces %IS_PRODUCTION% with true/false
- Handles build metadata injection from build-data/buildinfo.yml if available
- Cross-platform (macOS/Linux) sed commands

### Core Functionality

- **Confidence Visualization**: Color-codes AI response tokens based on log probability confidence levels
  - Green: High confidence (>70%)
  - Yellow: Medium confidence (30-70%) 
  - Red: Low confidence (<30%)
- **Interactive Tooltips**: Hover over tokens to see exact confidence percentages and alternative token possibilities
- **Token Usage Tracking**: Displays input/output/total tokens for each API call
- **Dual Output Modes**: Confidence visualization or plain markdown rendering
- **Temperature Control**: Adjustable temperature parameter for AI responses

### API Integration

Uses OpenRouter API with the openai/gpt-4o-mini model and log probabilities enabled. API calls are made directly from the frontend JavaScript with CORS handling.

### Environment Configuration

**Development**: 
- Optional .env.local file with OPENROUTER_API_KEY
- Falls back to manual API key input in browser if not provided

**Production**: 
- API key injected at build time via environment variables
- Static deployment to Cloudflare Pages with GitHub Actions automation

## File Organization

Source of truth is in `public/` folder. All development work should be done there. The build process copies to `dist/` and processes environment variables. Never edit files in `dist/` directly as they are overwritten during builds.