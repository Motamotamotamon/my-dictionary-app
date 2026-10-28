"""Build original bilingual learning notes. No dictionary text is copied."""
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
rows = [line.split('\t') for line in (root/'data/idioms/learning-notes.tsv').read_text().splitlines()]
assert all(len(row) == 5 and all(row) for row in rows)
rename = {"make up my mind": "make up one's mind", "take my time": "take one's time",
          "pull my leg": "pull someone's leg", "get on my nerves": "get on someone's nerves",
          "give me a hand": "give someone a hand"}
notes, aliases = {}, {}
forms = {
 "be": ["am", "is", "are", "was", "were", "been", "being"],
 "get": ["gets", "got", "gotten", "getting"],
 "make": ["makes", "made", "making"],
 "take": ["takes", "took", "taken", "taking"],
 "give": ["gives", "gave", "given", "giving"],
 "break": ["breaks", "broke", "broken", "breaking"],
 "bite": ["bites", "bit", "bitten", "biting"],
 "beat": ["beats", "beaten", "beating"],
 "spill": ["spills", "spilled", "spilt", "spilling"],
 "let": ["lets", "letting"], "hit": ["hits", "hitting"],
 "call": ["calls", "called", "calling"], "cut": ["cuts", "cutting"],
 "cost": ["costs", "costing"], "go": ["goes", "went", "gone", "going"],
 "keep": ["keeps", "kept", "keeping"], "lose": ["loses", "lost", "losing"],
 "pull": ["pulls", "pulled", "pulling"], "feel": ["feels", "felt", "feeling"],
 "end": ["ends", "ended", "ending"],
}
for raw, jp, definition, example, exampleJP in rows:
 word = rename.get(raw, raw).lower()
 assert word not in notes
 notes[word] = {"jp": jp, "senses": [[definition, jp, example, exampleJP]]}
 variants = {word, raw.lower()}
 for marker in ["one's", "someone's"]:
  if marker in word:
   variants.update(word.replace(marker, pronoun) for pronoun in ["my", "your", "his", "her", "its", "our", "their"])
 if "someone" in word and "someone's" not in word:
  variants.update(word.replace("someone", pronoun) for pronoun in ["me", "you", "him", "her", "us", "them", "somebody", "sb"])
 for variant in list(variants):
  first, _, rest = variant.partition(' ')
  variants.update(form + ' ' + rest for form in forms.get(first, []))
 for variant in variants - {word}:
  assert variant not in aliases or aliases[variant] == word
  aliases[variant] = word
aliases.update({"piece of cake": "a piece of cake", "rule of thumb": "a rule of thumb",
 "cannot help": "can't help", "can not help": "can't help",
 "beat about the bush": "beat around the bush",
 "off the top of your head": "off the top of my head",
 "off the top of his head": "off the top of my head",
 "off the top of her head": "off the top of my head"})
out = root/'data/idioms/learning-notes.json'
out.write_text(json.dumps({"notes": notes, "aliases": dict(sorted(aliases.items()))}, ensure_ascii=False, indent=2)+'\n')
print(f'{len(notes)} learning entries; {len(aliases)} explicit variants')
