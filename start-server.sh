#!/bin/bash

# Echoes of Eternity AR - Server Startup Script

echo "🏛️  Echoes of Eternity AR - Starting Server..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found"
    echo "Starting server on http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✓ Python found"
    echo "Starting server on http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. Please install Python 3 or use:"
    echo "   - Node.js: npx http-server -p 8000"
    echo "   - PHP: php -S localhost:8000"
    exit 1
fi

