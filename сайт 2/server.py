#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import json
import csv
import io
import os

PORT = 3000
HOST = "0.0.0.0"
DIRECTORY = "."

os.chdir(DIRECTORY)

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/changes':
            self.send_api_changes()
        else:
            super().do_GET()
    
    def send_api_changes(self):
        try:
            url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnixVAvnj2eKui4co3sdcSCLSXJDIUIGW9GblUhrUJLzIyDRQWyZISHnuNnCMAXTkV2wJfXmao0qP/pub?gid=1531258534&single=true&output=csv'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                csv_text = response.read().decode('utf-8')
            
            reader = csv.DictReader(io.StringIO(csv_text))
            changes = []
            for row in reader:
                if row.get('Дата и время') and row.get('Сайт'):
                    changes.append({
                        'date': row.get('Дата и время', '')[:10],
                        'site': row.get('Сайт', ''),
                        'change': row.get('Ячейка', ''),
                        'old': row.get('Старое значение', ''),
                        'new': row.get('Новое значение', '')
                    })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(changes, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            print(f'Error: {e}')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps([]).encode('utf-8'))
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

try:
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print(f"Server on http://{HOST}:{PORT}/")
        httpd.serve_forever()
except Exception as e:
    print(f'Startup error: {e}')
