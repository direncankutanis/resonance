"""Proposal-only upstream. No wallet, model, network calls or purchase execution."""
import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def validate(body):
    if type(body) is not dict or set(body) != {'action', 'asset', 'amountMinor'}:
        return 'Expected exactly action, asset and amountMinor'
    if body['action'] != 'buy' or body['asset'] != 'DEMO':
        return 'Unsupported action or asset'
    amount = body['amountMinor']
    if type(amount) is not int or not 10 < amount <= 2000:
        return 'Amount must be integer minor units between 11 and 2000'
    return None


class handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log authorization headers or request bodies.

    def reply(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        self.connection.settimeout(5)
        if self.path.split('?')[0] not in ('/proposals', '/api/proposals'):
            return self.reply(404, {'error': 'Unknown endpoint'})
        if len(secret) < 32:
            return self.reply(503, {'error': 'Service not configured', 'executed': False})
        auth = self.headers.get_all('Authorization', [])
        if len(auth) != 1 or not hmac.compare_digest(auth[0].encode(), ('Bearer ' + secret).encode()):
            return self.reply(401, {'error': 'Unauthorized'})
        lengths = self.headers.get_all('Content-Length', [])
        if self.headers.get('Transfer-Encoding') or len(lengths) != 1:
            return self.reply(400, {'error': 'Content-Length required'})
        try:
            length = int(lengths[0])
        except ValueError:
            return self.reply(400, {'error': 'Invalid length'})
        if not 0 < length <= 4096:
            return self.reply(413, {'error': 'Invalid body size'})
        if self.headers.get('Content-Type', '').split(';')[0].strip() != 'application/json':
            return self.reply(415, {'error': 'JSON required'})
        try:
            def unique(pairs):
                result = {}
                for key, value in pairs:
                    if key in result:
                        raise ValueError('Duplicate key')
                    result[key] = value
                return result
            body = json.loads(self.rfile.read(length), object_pairs_hook=unique)
        except (ValueError, UnicodeError, TimeoutError):
            return self.reply(400, {'error': 'Invalid JSON'})
        error = validate(body)
        if error:
            return self.reply(422, {'error': error, 'executed': False})
        self.reply(200, {'status': 'proposal_accepted', 'executed': False,
                         'mode': 'demo_proposal_only', 'proposal': body})

    def do_GET(self):
        self.reply(405, {'error': 'POST required'})

secret = os.environ.get("RESONANCE_PROPOSAL_SECRET", "")
