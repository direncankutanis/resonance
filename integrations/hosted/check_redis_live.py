"""Explicit live check: uses expiring test keys only; never prints credentials."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4
from integrations.hosted.service import json_request, LIMIT_SCRIPT

def main():
    private = Path.home() / 'Desktop/Resonance/.private'
    url = (private/'upstash-url.txt').read_text().strip()
    token = (private/'upstash-token.txt').read_text().strip()
    assert url.startswith('https://') and url.endswith('.upstash.io')
    assert token and not any(c.isspace() for c in token) and not token.startswith('{')
    headers = {'Authorization':'Bearer '+token}
    prefix = 'resonance:test:'+uuid4().hex
    def call(command):
        code, data = json_request(url, command, headers)
        assert code == 200 and 'error' not in data, 'Redis rejected test'
        return data['result']
    def attempt(_):
        return call(['EVAL', LIMIT_SCRIPT, 2, prefix+':budget', prefix+':cooldown', 3, 10])
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(attempt, range(5)))
    assert sum(result[0] for result in results) == 1, 'Concurrent admission failed'
    assert call(['GET', prefix+':budget']) == '1'
    ttl = call(['TTL', prefix+':budget'])
    assert 86300 <= ttl <= 86400
    # Separate quota-exhaustion fixture; never touches the production budget.
    call(['SET', prefix+':full', '3', 'EX', 60])
    full = call(['EVAL', LIMIT_SCRIPT, 2, prefix+':full', prefix+':unused', 3, 10])
    assert full[0] == 0 and 1 <= full[1] <= 60
    print('PASS: live Redis concurrent admission, persistent counter, expiry and cap rejection. Test keys expire automatically.')

if __name__ == '__main__':
    try: main()
    except Exception:
        print('FAIL: live Redis validation failed; credentials and provider details withheld.')
        raise SystemExit(1)
