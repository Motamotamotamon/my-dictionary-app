export type SavedWord = { id: number; content: string; jp?: string | null; meanings?: any[] | null; phonetic?: string | null; book?: string | null };
export function notesOf(item: SavedWord) {
  const first = item.meanings?.[0];
  return { note: first?.note || "", example: first?.userExample || "", exampleJP: first?.userExampleJP || "" };
}
export function withNotes(meanings: any, note: string, example: string, exampleJP: string) {
  const groups = Array.isArray(meanings) && meanings.length ? meanings : [{ partOfSpeech: "メモ", definitions: [] }];
  return groups.map((group: any, i: number) => i ? group : { ...group, note, userExample: example, userExampleJP: exampleJP });
}
export function matchesWord(item: SavedWord, query: string) {
  const text = [item.content, item.jp, ...Object.values(notesOf(item)), ...(item.meanings || []).flatMap(m => (m.definitions || []).flatMap((d: any) => [d.definition, d.jp, d.example, d.exampleJP]))].join(" ").normalize("NFKC").toLowerCase();
  return query.normalize("NFKC").toLowerCase().trim().split(/\s+/).every(term => text.includes(term));
}
