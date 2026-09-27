"""Proposal-only public service. Durable admission happens before provider calls."""
import json
import os
import re
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from integrations.latch.ai_plans import generate_plan, AIUnavailable
from integrations.latch.protection_plans import generate_protection

ORIGIN = 'https://resonance-learning-adventure.vercel.app'
# Atomic across all function instances; no visitor identifiers or prompts stored.
LIMIT_SCRIPT = '''
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
if used >= tonumber(ARGV[1]) then return {0, math.max(1, redis.call('TTL', KEYS[1]))} end
if redis.call('EXISTS', KEYS[2]) == 1 then return {0, math.max(1, redis.call('TTL', KEYS[2]))} end
redis.call('SET', KEYS[2], '1', 'EX', ARGV[2])
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 86400) end
return {1, 0}
'''

class Unavailable(Exception):
    pass


def json_request(url, payload, headers, timeout=6):
    request = Request(url, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json', **headers})
    try:
        with urlopen(request, timeout=timeout) as response:
            status, raw = response.status, response.read(32769)
    except HTTPError as error:
        status, raw = error.code, error.read(32769)
    if len(raw) > 32768:
        raise Unavailable()
    result = json.loads(raw)
    if type(result) is not dict:
        raise Unavailable()
    return status, result


def admit(kind):
    url = os.environ.get('UPSTASH_REDIS_REST_URL', '')
    token = os.environ.get('UPSTASH_REDIS_REST_TOKEN', '')
    if not re.fullmatch(r'https://[a-zA-Z0-9-]+\.upstash\.io', url) or not token:
        raise Unavailable()
    cap, spacing = (20, 10) if kind == 'ai' else (100, 7)
    # Fixed keys survive deployments. Rejected calls never reset the counter TTL.
    status, result = json_request(url, ['EVAL', LIMIT_SCRIPT, 2,
        'resonance:public:v1:'+kind+':budget', 'resonance:public:v1:'+kind+':cooldown', cap, spacing],
        {'Authorization': 'Bearer '+token})
    decision = result.get('result')
    if status != 200 or 'error' in result or type(decision) is not list or len(decision) != 2:
        raise Unavailable()
    allowed, retry = decision
    if type(allowed) is not int or allowed not in (0, 1) or type(retry) is not int or not 0 <= retry <= 86400:
        raise Unavailable()
    return allowed == 1, max(1, retry)


def parse_body(raw, kind):
    def pairs(items):
        result = {}
        for k, v in items:
            if k in result:
                raise ValueError()
            result[k] = v
        return result
    if kind not in ('ai', 'protection', 'latch'):
        raise ValueError()
    body = json.loads(raw, object_pairs_hook=pairs)
    if type(body) is not dict:
        raise ValueError()
    if kind in ('ai', 'protection'):
        if set(body) != {'prompt'} or type(body['prompt']) is not str or not 1 <= len(body['prompt'].strip()) <= 800:
            raise ValueError()
    elif set(body) != {'amountMinor'} or type(body['amountMinor']) is not int or not 100 <= body['amountMinor'] <= 10000:
        raise ValueError()
    return body


def process(kind, body):
    if os.environ.get('RESONANCE_HOSTED_SERVICES') != 'enabled':
        return 503, {'code': 'not_configured', 'executed': False}, None
    secret = os.environ.get('GEMINI_API_KEY' if kind in ('ai', 'protection') else 'LATCH_TOKEN', '').strip()
    if not secret:
        return 503, {'code': 'not_configured', 'executed': False}, None
    try:
        allowed, retry = admit('ai' if kind == 'protection' else kind)
        if not allowed:
            return 429, {'code': 'shared_limit', 'executed': False}, retry
        if kind == 'protection':
            return 200, {'plan': generate_protection(body['prompt'], api_key=secret), 'executed': False}, None
        if kind == 'ai':
            return 200, {'plan': generate_plan(body['prompt'], api_key=secret), 'executed': False}, None
        status, result = json_request('https://onlatch.com/proxy/proposals',
            {'action': 'buy', 'asset': 'DEMO', 'amountMinor': body['amountMinor']},
            {'Authorization': 'Bearer '+secret}, timeout=20)
        if status == 200 and result.get('status') == 'proposal_accepted' and result.get('executed') is False:
            decision = 'allow'
        elif status == 403 and result.get('deniedBy'):
            decision = 'deny'
        else:
            raise Unavailable()
        return 200, {'decision': decision, 'amountMinor': body['amountMinor'], 'executed': False}, None
    except AIUnavailable as error:
        return 503, {'code': error.code, 'executed': False}, None
    except (Unavailable, OSError, ValueError, TypeError):
        # Never echo provider responses, credentials, prompts or exception text.
        return 503, {'code': 'service_unavailable', 'executed': False}, None


class ServiceHandler(BaseHTTPRequestHandler):
    kind = None

    def log_message(self, *_):
        pass

    def reply(self, status, body, retry=None):
        raw = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'private, no-store')
        self.send_header('Content-Length', str(len(raw)))
        if retry is not None:
            self.send_header('Retry-After', str(retry))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        self.reply(405, {'code': 'post_required'})

    def do_POST(self):
        # Origin restrictions reduce browser misuse; they are not authentication.
        if self.headers.get('Origin') != ORIGIN or self.headers.get('X-Resonance-Request') != 'proposal-check':
            return self.reply(403, {'code': 'origin_denied'})
        if self.headers.get('Content-Type') != 'application/json' or self.headers.get('Transfer-Encoding'):
            return self.reply(400, {'code': 'invalid_request'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 4096:
                raise ValueError()
            self.connection.settimeout(5)
            raw = self.rfile.read(length)
            if len(raw) != length:
                raise ValueError()
            body = parse_body(raw, self.kind)
        except (ValueError, OSError):
            return self.reply(400, {'code': 'invalid_request'})
        self.reply(*process(self.kind, body))
