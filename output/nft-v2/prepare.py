"""Validate v2 publication assets, sync previews and create upload archive."""
import base64, hashlib, json, zipfile
from pathlib import Path
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
expected=[('Diren','Value conditions','Conditional buying'),('Ece','Risk conditions','Protection rules'),('Eric','Scheduled workflows','Periodic buying'),('Ade','Combined conditions','Combined rules')]
assert manifest['version']==2 and manifest['published'] is False
assert len(manifest['characters'])==4
images=[]
for index,(item,(name,concept,tool)) in enumerate(zip(manifest['characters'],expected)):
    assert (item['characterId'],item['character'],item['concept'],item['plannedTool'])==(index,name,concept,tool)
    raw=(root/item['metadata']).read_bytes(); png=(root/item['artwork']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==item['metadataSha256']
    assert hashlib.sha256(png).hexdigest()==item['artworkSha256']
    data=json.loads(raw); attrs={a['trait_type']:a['value'] for a in data['attributes']}
    assert attrs['Character']==name and attrs['Character ID']==index
    assert attrs['Learning concept']==concept and attrs['Planned vault tool']==tool
    assert attrs['Edition']=='v2' and attrs['Tool access']=='Not connected'
    assert base64.b64decode(data['image'].split(',',1)[1],validate=True)==png
    assert png[:8]==b'\x89PNG\r\n\x1a\n'
    assert int.from_bytes(png[16:20],'big')==720 and int.from_bytes(png[20:24],'big')==960
    images.append(data['image'])
(root.parent/'selection/nft-artwork.js').write_text('window.resonanceNFTArtwork='+json.dumps(images)+';\n')
with zipfile.ZipFile(root/'metadata-upload.zip','w',zipfile.ZIP_DEFLATED) as z:
    for item in manifest['characters']:
        path=root/item['metadata']; z.write(path,path.name)
print('PASS: all 4 character/concept/tool mappings, PNG dimensions, embedded artwork, hashes; preview synced and ZIP prepared.')
