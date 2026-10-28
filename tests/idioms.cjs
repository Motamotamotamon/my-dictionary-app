const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const root=require('node:path').resolve(__dirname,'..'),ts=require('typescript');const cache={};function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(root+'/'+file,'utf8'));if(cache[file])return cache[file];const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{module:m,exports:m.exports,require:n=>n.startsWith('@/')?load(n.slice(2)+(n.endsWith('.json')?'':'.ts')):require(n)});cache[file]=m.exports;return m.exports;}
const p=load('lib/phrases.ts');
for (const [query, expected] of [
 ['have a crush on', 'have a crush on'], ['HAS A CRUSH ON', 'have a crush on'],
 ['had a crush on', 'have a crush on'], ['have a crush on someone', 'have a crush on'],
 ['  have  a crush on  ', 'have a crush on'], ['ｈａｖｅ　ａ　ｃｒｕｓｈ　ｏｎ', 'have a crush on'],
 ['had a soft spot for', 'have a soft spot for'],
 ['fell in love with', 'fall in love with'], ['is in love with', 'be in love with']
]) {
 const entry=p.phraseEntry(query);
 assert.equal(entry?.word,expected,query);
 assert(entry.jp && entry.meanings.every(m=>m.definitions.every(d=>d.jp&&d.definition&&d.example&&d.exampleJP)));
 // Same complete dictionary shape passed to SaveButton and persisted as meanings.
 const saved=JSON.parse(JSON.stringify({content:entry.word,jp:entry.jp,meanings:entry.meanings}));
 assert.equal(saved.meanings[0].definitions[0].jp,entry.meanings[0].definitions[0].jp);
}
assert.equal(p.phraseEntry('fall in love with').meanings[0].definitions.length,2);
for (const query of ['crush', 'had a crush on', '恋心']) assert(p.phraseSuggestions(query).some(e=>e.word==='have a crush on'));
assert.equal(p.phraseEntry('I have a crush on Alex'),null);
assert.equal(p.phraseEntry('constructor'),null);
assert(p.phraseEntry('go out with').jp.includes('交際'));
console.log('PASS idioms: definitions/examples, inflections, normalization, suggestions, serializable saved senses, unknown input');

const expanded = load('data/idioms/learning-notes.json');
const corpus = load('lib/wordnet.ts');
assert.equal(Object.keys(expanded.notes).length, 100);
for (const [word, note] of Object.entries(expanded.notes)) {
 const entry = p.phraseEntry(word);
 assert.equal(entry.word, word);
 assert.equal(entry.jp, note.jp);
 assert(entry.meanings[0].definitions.every(d=>d.definition&&d.jp&&d.example&&d.exampleJP));
 const previous=corpus.corpusEntry(word);
 if(previous) for(const meaning of previous.meanings) for(const def of meaning.definitions)
  assert(entry.meanings.some(m=>m.definitions.some(d=>d.definition===def.definition)), 'Lost existing sense: '+word);
}
for(const [alias, canonical] of Object.entries(expanded.aliases)) assert.equal(p.phraseEntry(alias)?.word,canonical,alias);
for(const [query, canonical] of [
 ['made up her mind', "make up one's mind"],
 ['took their time', "take one's time"],
 ['is supposed to', 'be supposed to'],
 ['got the hang of', 'get the hang of'],
 ['can’t help', "can't help"],
 ['ａ　ｐｉｅｃｅ　ｏｆ　ｃａｋｅ', 'a piece of cake']
]) assert.equal(p.phraseEntry(query)?.word,canonical,query);
assert(p.phraseSuggestions('コツ').some(e=>e.word==='get the hang of'));
assert(p.phraseSuggestions('made up her mind').some(e=>e.word==="make up one's mind"));
for(const unknown of ['I feel like eating lunch', '__proto__', 'imaginary idiom qzx']) assert.equal(p.phraseEntry(unknown),null);
const added=Object.keys(expanded.notes).filter(word=>!corpus.corpusWords.includes(word)).length;
console.log('PASS 100 bilingual learning entries, '+Object.keys(expanded.aliases).length+' variants; existing senses preserved; '+added+' entries absent from exact WordNet corpus');

const bulk=load('data/idioms/idiomx.json');
assert.equal(Object.keys(bulk).length,1000);
assert.equal(Object.values(bulk).filter(e=>e.slang).length,44);
for(const [word, note] of Object.entries(bulk)){
 const e=p.phraseEntry(word);
 assert.equal(e.word,word);
 assert(e.meanings[0].definitions[0].definition);
 assert(e.source.includes('AI'));
 assert(e.sourceUrls.includes('/idiomx-attribution.txt'));
 if(note.slang) assert(e.usageNote.includes('失礼'));
 assert(!corpus.corpusWords.includes(word),'duplicate corpus entry');
 const saved=JSON.parse(JSON.stringify({content:word,meanings:e.meanings}));
 assert.equal(saved.meanings[0].definitions[0].definition,note.definition);
}
for(const bad of ['to the','i would','eye sex','get it up','on the boob','asian don\'t raisin'])
 assert(!Object.hasOwn(bulk,bad));
assert(p.phraseSuggestions('mic drop').some(e=>e.word==='mic drop'));
assert(p.phraseEntry('MIC DROP').usageNote.includes('スラング'));
console.log('PASS 1000 new entries, 44 slang labels, attribution, save payloads, filtering and suggestions');
