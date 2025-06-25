const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = process.env.PORT || 8000;

// Serve static files from current directory
app.use(express.static(__dirname));

// CORS headers for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Serve the main page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'logprobs.html'));
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
        open(`http://localhost:${port}`);
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
