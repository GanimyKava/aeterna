import http.server
import ssl
import socketserver
import sys
import gzip
import os
from io import BytesIO
from pathlib import Path


class OptimizedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Optimized HTTP request handler with caching and compression."""
    
    protocol_version = 'HTTP/1.1'
    
    # MIME types for common file extensions
    MIME_TYPES = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.yaml': 'text/yaml',
        '.yml': 'text/yaml',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.patt': 'application/octet-stream',
        '.fset': 'application/octet-stream',
        '.fset3': 'application/octet-stream',
        '.iset': 'application/octet-stream',
    }
    
    # Files that should be cached for a long time (static assets)
    CACHE_LONG = {'.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.webm', 
                  '.patt', '.fset', '.fset3', '.iset', '.js', '.css'}
    
    # Files that should not be cached (dynamic content)
    NO_CACHE = {'.html', '.yaml', '.yml', '.json'}
    
    def end_headers(self):
        """Add caching and compression headers."""
        # Ensure HTTP/1.1 Connection header
        connection = self.headers.get('Connection', '')
        if connection.lower() != 'close':
            self.send_header('Connection', 'keep-alive')
        
        path = Path(self.path.split('?')[0])
        ext = path.suffix.lower()
        
        # Add caching headers
        if ext in self.CACHE_LONG:
            # Cache static assets for 1 year
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        elif ext in self.NO_CACHE:
            # Don't cache dynamic content
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        else:
            # Default: cache for 1 hour
            self.send_header('Cache-Control', 'public, max-age=3600')
        
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        super().end_headers()
    
    def guess_type(self, path):
        """Override to use our MIME type mapping."""
        ext = Path(path).suffix.lower()
        return self.MIME_TYPES.get(ext, super().guess_type(path))
    
    
    def do_GET(self):
        """Override GET to handle root path."""
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Use parent's do_GET - it handles everything correctly
        super().do_GET()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()
    
    def version_string(self):
        """Return the server software version string."""
        return 'EchoesOfEternityAR/1.0'
    
    def log_message(self, format, *args):
        """Override to show more useful log messages."""
        # Log all messages for debugging
        super().log_message(format, *args)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
    handler = OptimizedHTTPRequestHandler

    # Change to the script's directory to ensure correct file serving
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Use ThreadingMixIn for better concurrency
    class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        daemon_threads = True
        allow_reuse_address = True

    with ThreadedHTTPServer(("0.0.0.0", port), handler) as httpd:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile="certs/cert.pem", keyfile="certs/key.pem")
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(f"🏛️  Echoes of Eternity AR - Optimized HTTPS Server")
        print(f"Serving HTTPS on https://0.0.0.0:{port}")
        print(f"Working directory: {os.getcwd()}")
        print("Features: Compression, Caching, Multi-threaded")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()


if __name__ == "__main__":
    main()


