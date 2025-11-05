#!/bin/bash

# Echoes of Eternity AR - Server Startup Script

echo "🏛️  Echoes of Eternity AR - Starting Server..."
echo ""

# Usage: ./start-server.sh
# Defaults: HTTP on port 8000; HTTPS on port 8443

MODE="https"
PORT="8443"

# Create certs directory if it doesn't exist
mkdir -p certs

# Ensure certs exist; generate self-signed if missing
if [ ! -f certs/cert.pem ] || [ ! -f certs/key.pem ]; then
    if command -v openssl &> /dev/null; then
        echo "Generating self-signed certificate (certs/cert.pem, certs/key.pem) ..."
        # Create config file for OpenSSL
        cat > certs/openssl.cnf << EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 10.0.0.138
EOF
        # Generate certificate with the config
        openssl req -x509 -newkey rsa:2048 -nodes \
            -keyout certs/key.pem -out certs/cert.pem \
            -days 365 -config certs/openssl.cnf

        # Clean up config file
        rm certs/openssl.cnf
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
