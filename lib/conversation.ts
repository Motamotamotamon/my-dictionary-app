// Original learning explanations. Auxiliary replies refer back to prior context.
const replies: Record<string, [string, string, string, string]> = {
  "i still do": ["今もそうです／今もそうしています", "The action or feeling mentioned earlier continues now. Do replaces that earlier verb phrase.", '“Do you still like this band?” “I still do.”', "「今でもこのバンドが好き？」「今も好きだよ。」"],
  "i do": ["そうです／そうします（前の話を受ける返答）", "An affirmative reply referring to an earlier action or feeling. The precise translation depends on that earlier statement.", '“Do you enjoy cooking?” “I do.”', "「料理は好き？」「好きです。」"],
  "i did": ["そうしました／以前はそうでした", "An affirmative reply about an earlier action or past situation.", '“Did you call her?” “I did.”', "「彼女に電話した？」「したよ。」"],
  "i don't": ["そうではありません／しません", "A negative reply about an action, habit, or feeling mentioned earlier.", '“Do you drink coffee?” “I don’t.”', "「コーヒーを飲む？」「飲みません。」"],
  "i don't anymore": ["今はもうそうではありません／もうしません", "Something that was true in the past is no longer true now.", '“Do you play tennis?” “I don’t anymore.”', "「テニスをする？」「今はもうしていません。」"],
  "i used to": ["以前はそうしていました／以前はそうでした", "An earlier habit or state is being contrasted with the present; the omitted action comes from context.", '“Do you live nearby?” “I used to.”', "「近くに住んでいるの？」「以前は住んでいました。」"],
  "so do i": ["私もそうです", "Agreement with another person's positive statement using an ordinary present-tense verb.", '“I like cooking.” “So do I.”', "「料理が好きです。」「私もです。」"],
  "neither do i": ["私もそうではありません／私もしません", "Agreement with another person's negative statement using an ordinary present-tense verb.", '“I don’t eat meat.” “Neither do I.”', "「肉は食べません。」「私も食べません。」"],
  "i do too": ["私もそうです", "The speaker shares the action or feeling just mentioned.", '“I miss our old school.” “I do too.”', "「昔の学校が懐かしいね。」「私もだよ。」"],
  "i think so": ["そうだと思います", "The speaker thinks the preceding idea is true, without expressing complete certainty.", '“Is the shop open?” “I think so.”', "「お店は開いている？」「そうだと思う。」"],
  "i hope so": ["そうだといいですね／そう願っています", "The speaker wants the preceding idea to be true.", '“Will it be sunny tomorrow?” “I hope so.”', "「明日は晴れるかな？」「そうだといいね。」"],
  "i guess so": ["たぶんそうだと思います", "Tentative agreement, sometimes with uncertainty or reluctance.", '“Is this the right bus?” “I guess so.”', "「このバスで合っている？」「たぶんそうだと思う。」"],
  "not really": ["あまりそうではありません／そうでもありません", "A softened negative answer; context determines what is being denied.", '“Are you tired?” “Not really.”', "「疲れた？」「そうでもないよ。」"],
  "not yet": ["まだです／まだしていません", "The expected action or situation has not happened up to now.", '“Have you finished?” “Not yet.”', "「終わった？」「まだだよ。」"],
};
export const conversationWords = Object.keys(replies);
export function conversationEntry(input: string) {
  // Permit sentence punctuation without guessing at longer arbitrary sentences.
  const key = input.toLowerCase().replace(/[.!?]+$/, "").trim();
  if (!Object.prototype.hasOwnProperty.call(replies, key)) return null;
  const [jp, definition, example, exampleJP] = replies[key];
  return {
    word: key.replace(/^i\b/, "I"), jp, phonetics: [],
    source: "アプリの会話表現ノート",
    sourceUrls: ["https://dictionary.cambridge.org/grammar/british-grammar/substitution"],
    usageNote: "前の発言を受ける表現です。何を指すかによって自然な日本語訳が変わります。",
    meanings: [{ partOfSpeech: "conversation / short reply", definitions: [{ definition, jp, example, exampleJP }] }],
  };
}

// High-confidence encyclopedic descriptions are not vocabulary definitions.
// Keep ordinary senses such as “a collection of songs” or “to record music”.
export function isWorkDescription(definition: string) {
  return /^(?:(?:a|an|the)\s+)?(?:(?:\d{4}|[a-z-]+)\s+){0,5}(?:studio\s+|solo\s+|debut\s+)?(?:album|song|film|movie|novel|television series|tv series|video game)\s+(?:by|from|directed by|written by|released|starring)\b/i.test(definition)
    || /^.{1,100}\bis (?:a|an|the)\s+(?:(?:\d{4}|[a-z-]+)\s+){0,5}(?:album|song|film|movie|novel|television series|video game)\s+(?:by|from|directed by|written by|released|starring)\b/i.test(definition);
}
