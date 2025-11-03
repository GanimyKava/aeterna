import http.server
import ssl
import socketserver
import sys


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
    handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("0.0.0.0", port), handler) as httpd:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile="certs/cert.pem", keyfile="certs/key.pem")
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(f"🏛️  Echoes of Eternity AR - HTTPS Server")
        print(f"Serving HTTPS on https://0.0.0.0:{port}")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()


if __name__ == "__main__":
    main()


