import data from "@/data/idioms/idiomx.json";
type Note = { definition: string; slang: boolean; register: string; region: string; tags: string; id: string };
const entries: Record<string, Note> = data;
export const idiomWords = Object.keys(entries);
export function idiomEntry(word: string) {
  if (!Object.prototype.hasOwnProperty.call(entries, word)) return null;
  const entry = entries[word];
  const usage = entry.slang
    ? "スラング・くだけた表現：親しい相手との会話向け。相手や文脈によって失礼になる場合があります。"
    : "慣用表現（用法・地域差は出典でも確認できます）";
  return {
    word, phonetics: [],
    source: "IdiomX / Wiktionary由来（AI補助による説明・分類、日本語は自動翻訳）",
    usageNote: usage + (entry.region === "US" ? " 主に米国。" : entry.region === "UK" ? " 主に英国。" : ""),
    sourceUrls: ["https://en.wiktionary.org/wiki/" + encodeURIComponent(word.replace(/ /g, "_")), "/idiomx-attribution.txt"],
    meanings: [{ partOfSpeech: entry.slang ? "idiom / slang" : "idiom", definitions: [{ definition: entry.definition }] }],
  };
}
