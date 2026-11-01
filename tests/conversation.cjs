const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const root=require('node:path').resolve(__dirname,'..'),ts=require('typescript');const cache={};function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(root+'/'+file,'utf8'));if(cache[file])return cache[file];const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{module:m,exports:m.exports,require:n=>n.startsWith('@/')?load(n.slice(2)+(n.endsWith('.json')?'':'.ts')):require(n)});cache[file]=m.exports;return m.exports;}

const c=load('lib/conversation.ts'), p=load('lib/phrases.ts');
for(const word of c.conversationWords){
 const e=p.phraseEntry(word);
 assert(e.jp&&e.usageNote);
 assert(e.meanings[0].definitions[0].exampleJP);
}
assert.equal(p.phraseEntry('Ｉ　still do!').jp,'今もそうです／今もそうしています');
assert.equal(p.phraseEntry('I DON’T').jp,'そうではありません／しません');
assert.equal(c.conversationEntry('i still do the dishes'),null);
assert.equal(c.conversationEntry('constructor'),null);
for(const d of ['a 2016 album by Eric Clapton.', 'the twentieth solo studio album by English musician Eric Clapton.', '"I Still Do" is a song by Bill Medley from the album of the same name.','a film directed by Jane Doe.']) assert(c.isWorkDescription(d),d);
for(const d of ['a collection of songs','a book of photographs','to record music','a thin layer of material','a song used to calm a child']) assert(!c.isWorkDescription(d),d);
assert(p.phraseSuggestions('i still').some(e=>e.word==='i still do'));
console.log('PASS conversational meaning priority, normalized replies, examples, entity filtering, ordinary senses preserved');
