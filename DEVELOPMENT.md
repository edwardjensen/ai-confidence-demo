# Development Guide

## Project Structure

This project has been cleaned up to eliminate file conflicts and duplication.

### Directory Structure

```text
/
├── index.html              # Smart redirect (tries /dist/, then /public/)
├── public/                 # Source files (development)
│   ├── index.html         
│   ├── script.js          
│   └── styles.css         
├── dist/                   # Built files (production)
│   ├── index.html         # Processed with env vars
│   ├── script.js          
│   └── styles.css         
├── build.sh               # Build script
└── server.js              # Development server
```

### Key Points

1. **Source of Truth**: All development work should be done in `public/` folder
2. **Build Process**: `build.sh` copies from `public/` → `dist/` and injects environment variables
3. **No Duplicates**: Root-level `script.js` and `styles.css` have been removed to eliminate conflicts

### Development Workflow

1. **Make changes** in `public/` folder
2. **Test locally** using the dev server: `npm run dev`
3. **Build for production**: `./build.sh` (requires `OPENROUTER_API_KEY`)
4. **Deploy** the `dist/` folder

### Smart Redirect

The root `index.html` now intelligently redirects:

- Production: `/dist/` (if available)
- Development: `/public/` (fallback)  
- Error: Shows helpful message if neither exists

This ensures the application works in both development and production environments without conflicts.
