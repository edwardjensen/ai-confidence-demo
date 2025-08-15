// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Serve static files from dist directory (built files)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve node_modules for client-side libraries
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// CORS headers for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Parse JSON bodies
app.use(express.json());

// API endpoint to proxy OpenRouter chat completions (for local development)
app.post('/api/chat', async (req, res) => {
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterApiKey) {
        return res.status(500).json({
            success: false,
            error: 'OpenRouter API key not configured in .env.local'
        });
    }
    
    try {
        const { model, messages, temperature } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: messages required'
            });
        }
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openrouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': req.get('referer') || 'http://localhost:8000',
                'X-Title': 'AI Confidence Demo'
            },
            body: JSON.stringify({
                model: model || 'openai/gpt-4o-mini',
                messages: messages,
                temperature: temperature || 0.7,
                logprobs: true,
                top_logprobs: 3
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenRouter API Error:', data);
            return res.status(response.status).json({
                success: false,
                error: data.error?.message || 'API request failed'
            });
        }
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// API endpoint to proxy OpenAI embeddings (for local development)
app.post('/api/embeddings', async (req, res) => {
    const openaiKey = process.env.OPENAI_KEY;
    
    if (!openaiKey) {
        return res.status(500).json({
            success: false,
            error: 'OpenAI API key not configured in .env.local'
        });
    }
    
    try {
        const { input, model, dimensions } = req.body;
        
        if (!input || (Array.isArray(input) && input.length === 0)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: input required'
            });
        }
        
        // Limit inputs to prevent abuse
        const inputs = Array.isArray(input) ? input : [input];
        if (inputs.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Too many inputs. Maximum 50 allowed.'
            });
        }
        
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: input,
                model: model || 'text-embedding-3-small',
                dimensions: dimensions || 1536
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenAI API Error:', data);
            return res.status(response.status).json({
                success: false,
                error: data.error?.message || 'API request failed'
            });
        }
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Serve the main landing page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve the confidence visualization demo
app.get('/confidence', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'confidence.html'));
});

// Serve the tokenization demo
app.get('/tokenization', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'tokenization.html'));
});

// Serve the embeddings visualization demo
app.get('/embeddings', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'embeddings.html'));
});

// Serve the privacy policy page
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'privacy.html'));
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - File Not Found</h1>
        <p>The requested file could not be found.</p>
        <p><a href="/">Return to AI Confidence Demo</a></p>
    `);
});

// Find available port and start server
function startServer(port) {
    const server = app.listen(port, 'localhost', () => {
        console.log('🚀 AI Confidence Demo Server started!');
        console.log('📍 Server running at: http://localhost:' + port);
        console.log('📁 Serving files from:', __dirname);
        console.log('🌐 Opening browser automatically...');
        console.log('⏹️  Press Ctrl+C to stop the server');
        console.log('-'.repeat(50));
        
        // Open browser automatically
        (async () => {
            try {
                const open = await import('open');
                await open.default(`http://localhost:${port}`);
            } catch (error) {
                console.log('⚠️  Could not open browser automatically:', error.message);
                console.log('🌐 Please manually open: http://localhost:' + port);
            }
        })();
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use, trying ${port + 1}...`);
            if (port < 8010) {
                startServer(port + 1);
            } else {
                console.error('Could not find an available port between 8000-8010');
                process.exit(1);
            }
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Server stopped. Goodbye!');
        server.close(() => {
            process.exit(0);
        });
    });
}

// Start the server
startServer(PORT);
