# AI Educational Demos

A comprehensive collection of interactive web-based tools that demonstrate fundamental AI concepts. These educational demos help users understand how modern AI models work by visualizing the underlying processes of tokenization, semantic representation, and confidence assessment.

For detailed explanations of the concepts behind these demos, see the supplemental blog post: [AI Confidence Probabilities](https://www.edwardjensen.net/posts/2025/2025-06/ai-confidence-probabilities)

## Available Demos

### 1. Tokenization Demo (`/tokenization`)

**Discover how AI breaks down language into processable units**

- Real-time text tokenization visualization as you type
- Interactive token exploration with detailed explanations
- Token statistics, compression ratios, and efficiency metrics
- Visual representation of how AI models split text into tokens
- Client-side processing using GPT-4 tokenization (cl100k_base encoding)
- No API key required - runs entirely in your browser

### 2. Embeddings Visualization (`/embeddings`)

**Explore how AI represents concepts in high-dimensional space**

- Interactive 2D scatterplot visualization of word embeddings
- Category-based coloring (emotions, animals, actions, concepts)
- Multiple dimension reduction techniques (t-SNE, PCA, UMAP)
- Click-to-explore word details and semantic similarities
- Real-time clustering and relationship analysis
- Demonstrates semantic understanding and concept mapping

### 3. Confidence Visualization (`/confidence`)

**See the uncertainty and decision-making process behind AI responses**

- Interactive chat interface with AI showing real-time confidence
- Color-coded confidence levels for each generated token
- Hover tooltips revealing exact probability scores and alternatives
- Adjustable temperature settings to control response randomness
- Token usage tracking and detailed response analysis
- Log probabilities analysis demonstrating AI uncertainty

## Common Features

- Clean, modern UI with consistent design language
- Responsive design optimized for desktop and mobile
- Accessibility features with proper ARIA labels
- Production deployment support via Cloudflare Pages

## Files

### Core Application Files

- `public/index.html` - Main landing page with demo navigation
- `public/tokenization.html` - Tokenization demonstration interface  
- `public/embeddings.html` - Embeddings visualization interface
- `public/confidence.html` - Confidence visualization demo interface
- `public/assets/styles.css` - Shared CSS styling for consistent design
- `public/script.js` - JavaScript for confidence visualization
- `server.js` - Node.js Express development server
- `build.sh` - Build script for production deployment
- `package.json` - NPM configuration and dependencies

### Built Files (Generated)

- `dist/` - Production-ready files created by build.sh

## Quick Start

### Prerequisites

Make sure you have Node.js installed (version 14 or higher). You can download it from [nodejs.org](https://nodejs.org/).

### Installation and Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure API Key (Optional - for automatic loading):**

Create a `.env.local` file in the project root with your OpenRouter API key:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

If you create this file, the application will automatically load your API key and skip the manual input step.

3. **Start the server:**

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
2. **Automatic Setup (Recommended)**: If you have a `.env.local` file with your API key, the confidence demo will automatically load it and be ready to use
3. **Manual Setup**: If no environment file is found, enter your OpenRouter API key when prompted in the confidence demo
4. **Navigate between demos:**
   - Main page (`/`) - Demo selection and navigation hub
   - Tokenization demo (`/tokenization`) - Real-time text tokenization (no API key required)
   - Embeddings visualization (`/embeddings`) - Word vector space exploration (no API key required)
   - Confidence demo (`/confidence`) - AI chat with confidence visualization (requires API key)
5. **For Tokenization Demo:** Type or paste text to see real-time tokenization breakdown
6. **For Embeddings Demo:** Explore the interactive scatterplot to see semantic relationships
7. **For Confidence Demo:** Start chatting with the AI and hover over colored tokens to see confidence levels

## API Key Configuration

**Note:** An OpenRouter API key is only required for the **Confidence Visualization demo** (`/confidence`). The Tokenization and Embeddings demos run entirely in your browser and don't require any API key.

For the Confidence demo, you'll need an OpenRouter API key. Get one at [openrouter.ai](https://openrouter.ai/).

### Method 1: Environment Variable (Recommended for Development)

Create a `.env.local` file in the project root:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

Benefits:

- Automatic loading for the confidence demo
- No need to enter the key manually each time
- Secure local development workflow

### Method 2: Manual Entry

If you don't have a `.env.local` file, the confidence demo will prompt you to enter your API key manually through the web interface.

The confidence demo uses the `openai/gpt-4o-mini` model with log probabilities enabled to show confidence levels.

## How It Works

### Tokenization Demo
- **Visual Breakdown**: See exactly how AI models split your text into processable tokens
- **Real-time Processing**: Tokenization happens instantly as you type
- **Statistical Analysis**: View token counts, compression ratios, and efficiency metrics
- **Educational**: Learn why tokenization is fundamental to AI language understanding

### Embeddings Visualization
- **Semantic Mapping**: Explore how AI represents concepts as high-dimensional vectors
- **Interactive Exploration**: Click and drag to explore relationships between words
- **Category Visualization**: See how similar concepts cluster together in vector space
- **Multiple Algorithms**: Switch between t-SNE, PCA, and UMAP dimension reduction techniques

### Confidence Visualization
- **Green tokens**: High confidence (>70%)
- **Yellow tokens**: Medium confidence (30-70%)  
- **Red tokens**: Low confidence (<30%)

### Interactive Features (Confidence Demo)

Hover over any colored token to see:

- Exact confidence percentage
- Alternative token possibilities with their probabilities

### Token Usage Tracking (Confidence Demo)

Each AI response shows:

- **Input tokens**: Number of tokens in your message
- **Output tokens**: Number of tokens generated by the AI
- **Total tokens**: Combined count for the exchange

This helps you monitor API usage and understand the cost implications of your conversations.

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

- **Privacy-First Design**: The Tokenization and Embeddings demos run entirely in your browser with no external API calls
- **API Key Safety**: For the Confidence demo, your OpenRouter API key is only stored in your browser's memory and is never sent to any server other than OpenRouter's official API
- **Local Server**: The web server runs locally on your machine and does not collect or transmit any data
- **Environment Variables**: When using `.env.local`, your API key is only accessible to your local development server and never exposed to external services
- **Client-Side Processing**: All tokenization and embeddings visualization happens in your browser without any data transmission

## Browser Compatibility

Works with all modern browsers including:

- Chrome/Chromium
- Firefox
- Safari
- Edge

## Deployment Options

### Local Development

Perfect for testing and development with manual API key input.

### Production Deployment

Deploy to Cloudflare Pages with pre-configured API key and automated workflows.
📖 **See [PRODUCTION.md](PRODUCTION.md) for complete setup guide**
