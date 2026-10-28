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
