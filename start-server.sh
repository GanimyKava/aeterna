#!/bin/bash

# Echoes of Eternity AR - Server Startup Script

echo "🏛️  Echoes of Eternity AR - Starting Server..."
echo ""

# Usage: ./start-server.sh
# Defaults: HTTP on port 8000; HTTPS on port 8443

MODE="https"
PORT="8443"

# Ensure certs exist; generate self-signed if missing
if [ ! -f certs/cert.pem ] || [ ! -f certs/key.pem ]; then
    if command -v openssl &> /dev/null; then
        echo "Generating self-signed certificate (certs/cert.pem, certs/key.pem) ..."
        openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365 -subj "/CN=localhost"
    else
        echo "❌ openssl not found. Please install openssl or provide certs/cert.pem and certs/key.pem."
        exit 1
    fi
fi

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found"
    echo "Starting HTTPS server on https://0.0.0.0:${PORT}"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 serve_https.py "$PORT"
elif command -v python &> /dev/null; then
    echo "✓ Python found"
    echo "Starting HTTPS server on https://0.0.0.0:${PORT}"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python serve_https.py "$PORT"
else
    echo "❌ Python not found. Please install Python 3 or use:"
    echo "   - Node.js: npx http-server -p 8000"
    echo "   - PHP: php -S localhost:8000"
    exit 1
fi
