// Original learning notes and examples; references are for sense verification.
const reference = "https://dictionary.cambridge.org/dictionary/english/";
const notes: Record<string, { jp: string; senses: [string, string, string, string][]; ref: string }> = {
  "go out with": { jp: "（人と）付き合う・交際する／一緒に外出する", ref: "go-out-with", senses: [
    ["To date someone or be their romantic partner.", "（人と）付き合う・交際する", "Maya has been going out with Ken since June.", "マヤは6月からケンと付き合っています。"],
    ["To leave home and spend time somewhere with another person; the context may be non-romantic.", "（恋愛とは限らず）人と一緒に外出する", "I often go out with my colleagues after work.", "仕事の後によく同僚と出かけます。"],
  ]},
  "look forward to": { jp: "〜を楽しみにする", ref: "look-forward-to", senses: [["To feel pleased about something that will happen. Use a noun or an -ing form after 'to'.", "〜を楽しみにする（toの後は名詞・動名詞）", "I look forward to seeing you next month.", "来月あなたに会うのを楽しみにしています。"]]},
  "put up with": { jp: "〜を我慢する", ref: "put-up-with", senses: [["To tolerate someone or something unpleasant.", "不快な人や物事を我慢する", "I cannot put up with this noise all night.", "一晩中この騒音を我慢することはできません。"]]},
  "get along with": { jp: "〜と仲良くやっていく", ref: "get-along", senses: [["To have a friendly relationship with someone.", "〜と仲良くやっていく", "She gets along with her new teammates.", "彼女は新しいチームメートとうまくやっています。"]]},
  "take care of": { jp: "〜の世話をする／〜に対処する", ref: "take-care-of", senses: [["To look after a person or thing, or deal with a task.", "〜の世話をする／用事や問題に対処する", "Could you take care of the plants this weekend?", "今週末、植物の世話をしてもらえますか。"]]},
  "run out of": { jp: "〜を使い果たす・切らす", ref: "run-out", senses: [["To use all of something so that none remains.", "〜を使い果たす・切らす", "We have run out of milk.", "牛乳を切らしてしまいました。"]]},
  "come up with": { jp: "（案・解決策などを）思いつく", ref: "come-up-with", senses: [["To think of or produce an idea or solution.", "案・解決策などを思いつく", "He came up with a simpler plan.", "彼はもっと簡単な計画を思いつきました。"]]},
  "get rid of": { jp: "〜を取り除く・処分する", ref: "get-rid-of", senses: [["To remove something that is unwanted.", "不要なものを取り除く・処分する", "We need to get rid of these empty boxes.", "この空き箱を処分する必要があります。"]]},
};

export function normalizeExpression(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function phraseEntry(value: string) {
  const word = normalizeExpression(value).toLowerCase();
  const note = notes[word];
  if (!note) return null;
  return {
    word, jp: note.jp, phonetics: [], source: "アプリの熟語学習ノート",
    sourceUrls: [reference + note.ref],
    meanings: [{ partOfSpeech: "phrase / phrasal verb", definitions: note.senses.map(([definition, jp, example, exampleJP]) => ({ definition, jp, example, exampleJP })) }],
  };
}
