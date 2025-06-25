# AI Confidence Demonstration Tool

A web-based tool that demonstrates AI confidence levels using OpenRouter API and log probabilities visualization.

## Features

- Interactive chat interface with AI
- Real-time confidence visualization using color-coded tokens
- Hover tooltips showing exact confidence percentages and alternatives
- Clean, modern UI with responsive design
- Log probabilities analysis for each AI response token

## Files

- `logprobs.html` - Main HTML interface
- `styles.css` - CSS styling
- `script.js` - JavaScript functionality
- `server.js` - Node.js Express web server
- `package.json` - NPM configuration and dependencies

## Quick Start

### Prerequisites

Make sure you have Node.js installed (version 14 or higher). You can download it from [nodejs.org](https://nodejs.org/).

### Installation and Setup

1. **Install dependencies:**

```bash
npm install
```

1. **Start the server:**

```bash
npm start
```

### Alternative NPM Commands

- `npm run dev` - Start development server
- `npm run serve` - Start server (same as start)

The server will automatically:

- Find an available port (starting from 3000)
- Open your default browser to the application
- Display the server URL in the terminal

## Setup

1. Start the server using one of the methods above
2. Enter your OpenRouter API key when prompted
3. Start chatting with the AI
4. Hover over colored tokens to see confidence levels and alternatives

## API Key

You'll need an OpenRouter API key to use this tool. Get one at [openrouter.ai](https://openrouter.ai/).

The tool uses the `openai/gpt-4o-mini` model with log probabilities enabled to show confidence levels.

## How It Works

- **Green tokens**: High confidence (>70%)
- **Yellow tokens**: Medium confidence (30-70%)  
- **Red tokens**: Low confidence (<30%)

Hover over any colored token to see:

- Exact confidence percentage
- Alternative token possibilities with their probabilities

## Requirements

- Node.js 14.x or higher
- Modern web browser
- OpenRouter API key
- Internet connection

## Installation

1. Clone or download this repository
1. Install dependencies:

   ```bash
   npm install
   ```

1. Start the server:

   ```bash
   npm start
   ```

## Security Notes

- **API Key Safety**: Your OpenRouter API key is only stored in your browser's memory and is never sent to any server other than OpenRouter's official API
- **Local Server**: The web server runs locally on your machine and does not collect or transmit any data
- **Client-Side Processing**: All confidence visualization happens in your browser

## Browser Compatibility

Works with all modern browsers including:

- Chrome/Chromium
- Firefox
- Safari
- Edge
