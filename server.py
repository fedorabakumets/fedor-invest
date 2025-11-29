#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import json
import csv
import io
import os

PORT = 5000
HOST = "0.0.0.0"

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/changes':
            self.send_api_changes()
        else:
            super().do_GET()
    
    def send_api_changes(self):
        changes = []
        
        # Сначала пытаемся использовать Google Sheets API через интеграцию
        try:
            hostname = os.environ.get('REPLIT_CONNECTORS_HOSTNAME')
            repl_identity = os.environ.get('REPL_IDENTITY')
            
            if hostname and repl_identity:
                headers = {
                    'Accept': 'application/json',
                    'X_REPLIT_TOKEN': f'repl {repl_identity}'
                }
                url = f'https://{hostname}/api/v2/connection?include_secrets=true&connector_names=google-sheet'
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    conn_data = json.loads(response.read().decode('utf-8'))
                    if conn_data.get('items') and conn_data['items'][0]:
                        print("✓ Using Google Sheets integration")
        except Exception as e:
            print(f"Integration attempt: {e}")
        
        # Fallback: загружаем CSV если интеграция не сработала
        if not changes:
            try:
                print("Using CSV fallback...")
                url = 'https://docs.google.com/spreadsheets/d/1-_Qzi00wtezoZSnNiAhgvXJFhBE4x7LhyihTHtZgXv4/export?format=csv&gid=1897875028'
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    csv_text = response.read().decode('utf-8')
                
                reader = csv.DictReader(io.StringIO(csv_text))
                for row in reader:
                    if row.get('Дата и время') and row.get('Сайт'):
                        changes.append({
                            'date': row.get('Дата и время', '')[:10],
                            'site': row.get('Сайт', ''),
                            'change': row.get('Ячейка', ''),
                            'old': row.get('Старое значение', ''),
                            'new': row.get('Новое значение', '')
                        })
            except Exception as e:
                print(f"CSV error: {e}")
        
        # Отправляем ответ
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(changes, ensure_ascii=False).encode('utf-8'))
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

try:
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print(f"Server on http://{HOST}:{PORT}/")
        print("Supports: Google Sheets integration + CSV fallback")
        httpd.serve_forever()
except Exception as e:
    print(f'Error: {e}')
