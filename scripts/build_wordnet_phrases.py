"""Build a multiword verb/adverb/adjective subset from WordNet 3.0 (NLTK archive).
Usage: python scripts/build_wordnet_phrases.py /path/to/wordnet.zip
No noun compounds/names are included. Senses follow the original index order.
"""
from pathlib import Path
from zipfile import ZipFile
import sys,json,re,hashlib
z=ZipFile(sys.argv[1]);out=Path(__file__).resolve().parents[1]/'data/wordnet';out.mkdir(parents=True,exist_ok=True)
entries={}
for pos,part in [('verb','verb'),('adv','adverb'),('adj','adjective')]:
 data=z.read('wordnet/data.'+pos)
 for line in z.read('wordnet/index.'+pos).decode().splitlines():
  if not line or line.startswith(' '): continue
  fields=line.split();lemma=fields[0]
  if '_' not in lemma: continue
  word=lemma.replace('_',' ')
  if len(word)>100: continue
  count=int(fields[2]);offsets=fields[-count:];defs=[]
  for offset in offsets:
   raw=data[int(offset):].split(b'\n',1)[0].decode();gloss=raw.split('|',1)[1].strip()
   definition=gloss.split('; "',1)[0].strip().rstrip(';')
   examples=re.findall(r'"([^"]+)"',gloss)
   # Synset examples can use another synonym: include only when the exact expression appears.
   example=next((e for e in examples if word.lower() in e.lower()),'')
   d={'definition':definition}
   if example:d['example']=example
   defs.append(d)
  entries.setdefault(word,{})[part]=defs
for char in 'abcdefghijklmnopqrstuvwxyz':
 subset={k:v for k,v in entries.items() if k.startswith(char)}
 (out/(char+'.json')).write_text(json.dumps(subset,ensure_ascii=False,separators=(',',':'))+'\n')
other={k:v for k,v in entries.items() if k[0] not in 'abcdefghijklmnopqrstuvwxyz'}
(out/'other.json').write_text(json.dumps(other,separators=(',',':'))+'\n')
starts={key.split(' ')[0] for key, parts in entries.items() if 'verb' in parts}
exceptions={}
for line in z.read('wordnet/verb.exc').decode().splitlines():
 fields=line.split(); bases=[base for base in fields[1:] if base in starts]
 if bases: exceptions[fields[0]]=bases
(out/'verb-exceptions.json').write_text(json.dumps(exceptions,separators=(',',':'))+'\n')
(out/'LICENSE.txt').write_bytes(z.read('wordnet/LICENSE'))
manifest={'source':'Princeton WordNet 3.0, derived multiword subset','archive_sha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'expressions':len(entries),'senses':sum(len(ds) for ps in entries.values() for ds in ps.values()),'parts':['verb','adverb','adjective'],'excluded':'noun compounds and names','license':'LICENSE.txt'}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(manifest)
print('bytes:',sum(p.stat().st_size for p in out.iterdir()),'largest shard:',max(p.stat().st_size for p in out.glob('*.json')))
