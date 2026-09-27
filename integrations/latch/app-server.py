"""Loopback-only preview + fixed Latch proposal endpoint. Never serves credentials."""
import json
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import urllib.request
import urllib.error
import threading
import time
from ai_plans import generate_plan, validate_plan, AIUnavailable

ROOT = Path.home() / 'Desktop/Resonance/previews'
TOKEN = Path.home() / 'Desktop/Resonance/.private/latch-token.txt'
ORIGIN = 'http://127.0.0.1:8767'
lock = threading.Lock()
last_call = 0

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_):
        pass

    def reply(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        global last_call
        if self.path not in ('/api/latch/check', '/api/ai/plan', '/api/ai/protection'):
            return self.reply(404, {'error':'Unknown endpoint'})
        if self.headers.get('Host') != '127.0.0.1:8767' or self.headers.get('Origin') != ORIGIN or self.headers.get('X-Resonance-Request') != 'proposal-check':
            return self.reply(403, {'error':'Local application requests only'})
        if self.headers.get('Content-Type') != 'application/json' or self.headers.get('Transfer-Encoding'):
            return self.reply(400, {'error':'JSON required'})
        try:
            n = int(self.headers.get('Content-Length','0'))
            if not 0 < n <= 4096: raise ValueError()
            self.connection.settimeout(5)
            body = json.loads(self.rfile.read(n))
            if self.path in ('/api/ai/plan', '/api/ai/protection'):
                if type(body) is not dict or set(body) != {'prompt'}: raise ValueError()
                try:
                    plan = generate_plan(body['prompt'], _protection=self.path == '/api/ai/protection')
                except AIUnavailable as e:
                    return self.reply(503, {'error':'AI draft unavailable', 'code':e.code})
                return self.reply(200, {'plan':plan, 'executed':False})
            if type(body) is not dict or set(body) != {'amountMinor'}: raise ValueError()
            amount = body['amountMinor']
            if type(amount) is not int or not 100 <= amount <= 10000: raise ValueError()
        except (ValueError, TimeoutError):
            return self.reply(400, {'error':'Invalid demo budget'})
        if not lock.acquire(blocking=False):
            return self.reply(429, {'error':'A check is already running'})
        try:
            if time.monotonic() - last_call < 7:
                return self.reply(429, {'error':'Wait a few seconds before checking again'})
            last_call = time.monotonic()
            token = TOKEN.read_text().strip()
            if not token.startswith('lat_'): raise ValueError()
            request = urllib.request.Request('https://onlatch.com/proxy/proposals',
                data=json.dumps({'action':'buy','asset':'DEMO','amountMinor':amount}).encode(),
                headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
            try:
                with urllib.request.urlopen(request,timeout=20) as r:
                    status, raw = r.status, r.read(16384)
            except urllib.error.HTTPError as e:
                status, raw = e.code, e.read(16384)
            result = json.loads(raw)
            if status == 200 and result.get('executed') is False and result.get('status') == 'proposal_accepted':
                return self.reply(200, {'decision':'allow','amountMinor':amount,'executed':False})
            if status == 403 and result.get('deniedBy'):
                return self.reply(200, {'decision':'deny','amountMinor':amount,'executed':False})
            self.reply(502, {'error':'Latch check unavailable; no approval recorded'})
        except (OSError, ValueError):
            self.reply(502, {'error':'Latch connection unavailable; no approval recorded'})
        finally:
            lock.release()

if __name__ == '__main__':
    print('Resonance with Latch: '+ORIGIN+'/vault/index.html')
    ThreadingHTTPServer(('127.0.0.1',8767),Handler).serve_forever()
