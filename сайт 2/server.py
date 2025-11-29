#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import json

PORT = 5000
HOST = "0.0.0.0"

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/changes':
            try:
                url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnixVAvnj2eKui4co3sdcSCLSXJDIUIGW9GblUhrUJLzIyDRQWyZISHnuNnCMAXTkV2wJfXmao0qP/pub?gid=1531258534&single=true&output=csv'
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as r:
                    csv = r.read().decode('utf-8')
                lines = csv.strip().split('\n')
                changes = []
                for line in lines[1:]:
                    p = [x.strip() for x in line.split(',', 4)]
                    if len(p) >= 3 and p[0] and p[2]:
                        changes.append({'date': p[0][:10], 'site': p[2], 'change': f"ячейка {p[1]}", 'old': p[3] if len(p)>3 else '', 'new': p[4] if len(p)>4 else ''})
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(changes).encode('utf-8'))
            except:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps([]).encode('utf-8'))
        else:
            super().do_GET()
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print(f"Server on http://{HOST}:{PORT}/")
    httpd.serve_forever()
