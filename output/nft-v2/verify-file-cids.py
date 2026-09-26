"""Verify four separately pinned metadata CIDs; order is determined by exact local hashes."""
import base64, concurrent.futures, datetime, hashlib, json, re, sys, subprocess
from pathlib import Path
root=Path(__file__).resolve().parent
cids=sys.argv[1:]
if len(cids)!=4 or len(set(cids))!=4 or any(not re.fullmatch(r'b[a-z2-7]{20,}|Qm[1-9A-HJ-NP-Za-km-z]{44}',c) for c in cids):
    raise SystemExit('Provide four distinct file CIDs.')
manifest=json.loads((root/'manifest.json').read_text())
def verify(cid):
    url='https://gateway.pinata.cloud/ipfs/'+cid
    raw=subprocess.run(['curl','--silent','--show-error','--fail','--location','--proto','=https','--proto-redir','=https','--max-time','40','--max-filesize','5242880',url],capture_output=True,check=True).stdout
    if len(raw)>5*1024*1024: raise ValueError('File too large: '+cid)
    digest=hashlib.sha256(raw).hexdigest()
    item=next((x for x in manifest['characters'] if x['metadataSha256']==digest),None)
    if not item: raise ValueError('File is not an exact v2 metadata match: '+cid)
    data=json.loads(raw);prefix='data:image/png;base64,'
    if not data['image'].startswith(prefix): raise ValueError('Unexpected image encoding')
    png=base64.b64decode(data['image'][len(prefix):],validate=True)
    if hashlib.sha256(png).hexdigest()!=item['artworkSha256']: raise ValueError('Artwork mismatch')
    return {'characterId':item['characterId'],'character':item['character'],'uri':'ipfs://'+cid,'gatewayVerified':url,'metadataSha256':digest,'artworkSha256':item['artworkSha256']}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(verify,cids))
results.sort(key=lambda x:x['characterId'])
if [r['characterId'] for r in results]!=[0,1,2,3]: raise ValueError('Not four distinct characters')
report={'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'metadataVersion':2,'layout':'individual-file-cids','metadataVerified':True,'pinRetentionVerified':False,'walletRenderingVerified':False,'publicDeployment':False,'characters':results}
(root/'publication-verification.json').write_text(json.dumps(report,indent=2)+'\n')
(root/'constructor-uris.json').write_text(json.dumps([r['uri'] for r in results],indent=2)+'\n')
for r in results: print(r['character']+': '+r['uri']+' — metadata and artwork MATCH')
print('Verified all four files. Constructor URIs saved in character order. Wallet rendering and pin retention remain unverified.')
