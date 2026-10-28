"""Import a filtered CC BY-SA subset; requires pyarrow. Usage: python script archive.parquet"""
import sys,json,re,hashlib
from pathlib import Path
import pyarrow.parquet as pq
root=Path(__file__).resolve().parents[1]
existing=set()
for p in (root/'data/wordnet').glob('*.json'):
 if p.stem not in ['manifest','verb-exceptions']: existing.update(json.loads(p.read_text()))
existing.update(json.loads((root/'data/idioms/learning-notes.json').read_text())['notes'])
existing.update(re.findall(r'^  "([^"]+)": \{', (root/'lib/phrases.ts').read_text(), re.M))
existing.update(json.loads((root/'data/idioms/learning-notes.json').read_text())['aliases'])
existing.update(re.findall(r'"([^"]+)": "', (root/'lib/phrases.ts').read_text()))
candidates={}
for r in pq.read_table(sys.argv[1]).to_pylist():
 w=(r['idiom_canonical'] or '').lower().strip()
 if r['source'] not in ['kaikki_wiktionary','wiktionary_slang_kaikki']: continue
 if not w or w in existing or len(w)>70 or not re.fullmatch(r"[a-z][a-z '\-]+",w): continue
 if r['validation_status']!='valid' or r['is_adversarial_example']: continue
 if str(r['offensive_flag']).lower() not in ['false','none']: continue
 tags=(r['tags'] or '').lower()
 if any(t in tags for t in ['archaic','obsolete','dated','offensive','derogatory','vulgar','slur']): continue
 if r['learner_difficulty'] not in ['easy','medium']: continue
 definition=r['idiom_canonical_meaning']
 if not definition or len(definition)>600: continue
 if 'idiomatic' not in tags and 'slang' not in tags: continue
 if len(w.split()) < 3 and w not in {'no probs','no shot','mic drop','big bucks','big deal','go nuts','go figure','crush it','hard pass','no dice','old flame','red flag','red tape','night owl','cash cow','all ears','hit it off','say less','built different','no notes','keep it real'}: continue
 if r['regionality'] not in ['general','US','UK']: continue
 if re.search(r'sexual|sex |penis|vagina|intercourse|masturb|offensive|derogatory|vulgar|slur|racist|prostitut|suicide|kill oneself', w+' '+definition+' '+tags, re.I): continue
 if w.startswith(('to the ', 'i would ', 'i am ', 'i was ')): continue
 slang=r['slang_strength'] in ['weak','medium','strong'] or 'slang' in tags
 entry={'definition':definition,'slang':slang,'register':r['idiom_register'],'region':r['regionality'],'tags':tags,'id':r['idiom_id']}
 candidates.setdefault(w,entry)
slang=sorted((w for w,e in candidates.items() if e['slang']),key=lambda w:(len(w.split()),len(w),w))
other=sorted((w for w,e in candidates.items() if not e['slang']),key=lambda w:(len(w.split()),len(w),w))
approved = {"no shot","mic drop","no probs","say less","built different","do a bunk","in the bag","suck it up","can you not","in the soup","drop the mic","hit the road","roll with it","bucket of bolts","case the joint","catch a stray","choose your fighter","drop a dime","eat someone's lunch","flash the cash","float someone's boat","get the bullet","haters gonna hate","here's the deal","hit rock bottom","i just work here","let that sink in","mugged by reality","my head's a shed","ninjas cutting onions","on the down-low","pull a fast one","ready to roll","squash the beef","take a whack at","take the mickey","take the rap","that ain't it","that's a bar","that's what's up","up and at 'em","what's the deal","what's the haps","where you at"}
selected_slang=[w for w in slang if w in approved]
chosen=selected_slang+other[:1000-len(selected_slang)]
assert len(chosen)==1000 and len(set(chosen))==1000,(len(slang),len(other))
out=root/'data/idioms/idiomx.json'
out.write_text(json.dumps({w:candidates[w] for w in sorted(chosen)},ensure_ascii=False,separators=(',',':'))+'\n')
(root/'data/idioms/idiomx-manifest.json').write_text(json.dumps({'entries':1000,'slang':len(selected_slang),'source':'https://huggingface.co/datasets/aymansharara/IdiomX','sha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'license':'CC-BY-SA-4.0','changes':'Filtered, normalized, examples omitted. Definitions and usage labels are AI-enriched upstream, not individually verified. Japanese translations are supplied at runtime.'},indent=2)+'\n')
print(len(candidates), 'candidates; selected 1000; slang:',len(selected_slang))
print(chosen[:30])
