"""Live proposal-only smoke test. Reads token locally; never prints credentials."""
import json
from pathlib import Path
import urllib.request
import urllib.error

path = Path.home() / 'Desktop/Resonance/.private/latch-token.txt'
token = path.read_text().strip() if path.exists() else ''
if not token.startswith('lat_') or any(c.isspace() for c in token):
    raise SystemExit('Save the Latch access token in .private/latch-token.txt first.')
results = []
for name, amount, expected in [('within_cap', 2000, 200), ('over_cap', 3000, 403)]:
    request = urllib.request.Request('https://onlatch.com/proxy/proposals',
        data=json.dumps({'action':'buy','asset':'DEMO','amountMinor':amount}).encode(),
        headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(request,timeout=30) as response:
            status, raw = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, raw = error.code, error.read()
    try:
        body = json.loads(raw)
    except ValueError:
        body = {}
    result = {'case':name,'status':status,'expected':expected}
    if expected == 200:
        result['passed'] = status == 200 and body.get('executed') is False and body.get('status') == 'proposal_accepted'
    else:
        result['passed'] = status == 403 and bool(body.get('deniedBy'))
    results.append(result)
    print(json.dumps(result))
Path(__file__).with_name('live-proxy-results.json').write_text(json.dumps(results,indent=2))
if not all(r['passed'] for r in results):
    raise SystemExit('Live verification incomplete; inspect the Latch activity trace without exposing credentials.')
