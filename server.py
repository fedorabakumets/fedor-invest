#!/usr/bin/env python3
"""
Simple HTTP server for site2 on port 5000 with cache control headers.
"""
import http.server
import socketserver
import os
from http import HTTPStatus

PORT = 5000
HOST = "0.0.0.0"
DIRECTORY = "./site2"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with cache control headers."""
    
    def translate_path(self, path):
        """Serve files from site2 directory."""
        if path == '/':
            path = '/index.html'
        return os.path.join(DIRECTORY, path.lstrip('/'))
    
    def end_headers(self):
        """Add cache control headers to prevent browser caching."""
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Override to provide cleaner logging."""
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    with socketserver.TCPServer((HOST, PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Site 2 Server running at http://{HOST}:{PORT}/")
        print(f"Serving files from: {DIRECTORY}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
