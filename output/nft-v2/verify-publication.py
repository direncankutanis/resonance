"""Verify pinned metadata before deployment; requires no credentials.
Usage: python3 verify-publication.py CID https://YOUR-GATEWAY/ipfs
The uploaded directory must contain diren.json, ece.json, eric.json, ade.json.
"""
import base64, hashlib, json, re, sys, urllib.request
from pathlib import Path
from urllib.parse import urlsplit
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
if len(sys.argv)!=3:
    raise SystemExit(__doc__)
cid,gateway=sys.argv[1:]
if not re.fullmatch(r'(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})',cid):
    raise SystemExit('Invalid or unsupported CID format.')
u=urlsplit(gateway)
if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment:
    raise SystemExit('Use an HTTPS gateway base URL without credentials, query or fragment.')
results=[]
for item in manifest['characters']:
    filename=Path(item['metadata']).name
    url=f'{gateway.rstrip("/")}/{cid}/{filename}'
    req=urllib.request.Request(url,headers={'Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=30) as response:
        if urlsplit(response.url).scheme!='https':
            raise SystemExit('Rejected non-HTTPS redirect.')
        raw=response.read(5*1024*1024+1)
    if len(raw)>5*1024*1024:
        raise SystemExit('Metadata exceeds verification size limit.')
    if hashlib.sha256(raw).hexdigest()!=item['metadataSha256']:
        raise SystemExit(f'Metadata mismatch: {filename}')
    data=json.loads(raw)
    prefix='data:image/png;base64,'
    if not data.get('image','').startswith(prefix):
        raise SystemExit(f'Unexpected image encoding: {filename}')
    png=base64.b64decode(data['image'][len(prefix):],validate=True)
    if hashlib.sha256(png).hexdigest()!=item['artworkSha256']:
        raise SystemExit(f'Artwork mismatch: {filename}')
    results.append({'character':item['character'],'uri':f'ipfs://{cid}/{filename}','gatewayVerified':url})
report={'metadataVerified':True,'pinRetentionVerified':False,'walletRenderingVerified':False,'publicDeployment':False,'characters':results}
(root/'publication-verification.json').write_text(json.dumps(report,indent=2)+'\n')
(root/'constructor-uris.json').write_text(json.dumps([r['uri'] for r in results],indent=2)+'\n')
print('All 4 metadata files and images match. Constructor URI file created. Wallet rendering and pin retention still need checking.')
