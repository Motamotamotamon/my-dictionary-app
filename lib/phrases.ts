import learningNotes from "@/data/idioms/learning-notes.json";
import { corpusEntry, corpusWords } from "@/lib/wordnet";
// Original learning notes and examples; references are for sense verification.
const reference = "https://dictionary.cambridge.org/dictionary/english/";
const notes: Record<string, { jp: string; senses: string[][]; ref?: string }> = {
  ...learningNotes.notes,
  "have a crush on": { jp: "（人に）恋心を抱く・夢中になる", ref: "have-a-crush-on", senses: [
    ["To feel a strong romantic attraction to someone, often without a relationship having started. Follow on with the person you like.", "（人に）恋心を抱く・夢中になる。片思いにも使うが、相手も好きかどうかはこの表現だけでは分からない。onの後に相手を置く。", "I have a crush on someone in my class.", "同じクラスの人に恋をしています。"],
  ]},
  "have a soft spot for": { jp: "〜に特別な愛着がある・〜に弱い", ref: "love", senses: [
    ["To feel particular affection for someone or something. This does not have to be romantic.", "人や物に特別な愛着がある（恋愛感情とは限らない）", "I have a soft spot for old bookstores.", "古い本屋には特別な愛着があります。"],
  ]},
  "fall in love with": { jp: "〜に恋をする・〜に夢中になる", ref: "love", senses: [
    ["To begin to love someone romantically.", "（人に）恋をする・恋に落ちる", "She fell in love with her best friend.", "彼女は親友に恋をしました。"],
    ["To begin to like a place or thing very much.", "（場所や物を）とても好きになる・夢中になる", "We fell in love with the town on our first visit.", "初めて訪れたとき、その町が大好きになりました。"],
  ]},
  "be in love with": { jp: "〜を愛している・〜に恋をしている", ref: "love", senses: [
    ["To feel romantic love for someone.", "（人を）愛している・恋をしている", "He is in love with his childhood friend.", "彼は幼なじみに恋をしています。"],
  ]},
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
  "give up": {"jp": "あきらめる・やめる", "ref": "give-up", "senses": [["To stop trying or stop doing something.", "あきらめる・やめる", "Do not give up on your goal.", "目標をあきらめないで。"]]},
  "look after": {"jp": "〜の世話をする", "ref": "look-after", "senses": [["To care for a person, animal, or thing.", "〜の世話をする", "Can you look after my cat tomorrow?", "明日、猫の世話をしてもらえますか。"]]},
  "look for": {"jp": "〜を探す", "ref": "look-for", "senses": [["To try to find someone or something.", "〜を探す", "I am looking for my keys.", "鍵を探しています。"]]},
  "look up": {"jp": "（情報を）調べる", "ref": "look-up", "senses": [["To find information in a reference source.", "（情報を）調べる", "I looked up the word in a dictionary.", "辞書でその単語を調べました。"]]},
  "look into": {"jp": "〜を調査する", "ref": "look-into", "senses": [["To investigate a situation or problem.", "〜を調査する", "We will look into the cause of the delay.", "遅れの原因を調べます。"]]},
  "find out": {"jp": "知る・突き止める", "ref": "find-out", "senses": [["To discover a fact or learn new information.", "知る・突き止める", "I found out why the train was late.", "電車が遅れた理由が分かりました。"]]},
  "figure out": {"jp": "理解する・解決する", "ref": "figure-out", "senses": [["To understand something by thinking about it.", "理解する・解決する", "I finally figured out how to use the app.", "やっとアプリの使い方が分かりました。"]]},
  "put off": {"jp": "延期する", "ref": "put-off", "senses": [["To delay an activity until a later time.", "延期する", "We put off the picnic until Sunday.", "ピクニックを日曜日に延期しました。"]]},
  "turn down": {"jp": "断る／音量などを下げる", "ref": "turn-down", "senses": [["To reject an offer or reduce a setting such as volume.", "断る／音量などを下げる", "She turned down the offer politely.", "彼女はその申し出を丁寧に断りました。"]]},
  "turn up": {"jp": "現れる／音量などを上げる", "ref": "turn-up", "senses": [["To arrive or increase a setting such as volume.", "現れる／音量などを上げる", "He turned up just before lunch.", "彼は昼食の直前に現れました。"]]},
  "turn on": {"jp": "（機器・電気を）つける", "ref": "turn-on", "senses": [["To make a device start operating.", "（機器・電気を）つける", "Please turn on the light.", "電気をつけてください。"]]},
  "turn off": {"jp": "（機器・電気を）消す", "ref": "turn-off", "senses": [["To make a device stop operating.", "（機器・電気を）消す", "Turn off the oven when you finish.", "終わったらオーブンを切ってください。"]]},
  "pick up": {"jp": "拾う／迎えに行く", "ref": "pick-up", "senses": [["To lift something or collect someone from a place.", "拾う／迎えに行く", "I will pick you up at the station.", "駅まで迎えに行きます。"]]},
  "take off": {"jp": "脱ぐ／離陸する", "ref": "take-off", "senses": [["To remove clothing, or to leave the ground in an aircraft.", "脱ぐ／離陸する", "Our plane took off at noon.", "私たちの飛行機は正午に離陸しました。"]]},
  "put on": {"jp": "身につける", "ref": "put-on", "senses": [["To dress yourself in an item of clothing.", "身につける", "Put on a coat before you go outside.", "外に出る前にコートを着て。"]]},
  "get over": {"jp": "（病気・困難から）回復する・乗り越える", "ref": "get-over", "senses": [["To recover from an illness or a difficult experience.", "（病気・困難から）回復する・乗り越える", "It took me a week to get over the cold.", "風邪が治るまで1週間かかりました。"]]},
  "carry on": {"jp": "続ける", "ref": "carry-on", "senses": [["To continue an activity.", "続ける", "Please carry on with your work.", "仕事を続けてください。"]]},
  "break down": {"jp": "故障する／感情を抑えられなくなる", "ref": "break-down", "senses": [["To stop working, or to lose emotional control.", "故障する／感情を抑えられなくなる", "Our car broke down near the bridge.", "車が橋の近くで故障しました。"]]},
  "bring up": {"jp": "（話題を）持ち出す／育てる", "ref": "bring-up", "senses": [["To mention a topic or raise a child.", "（話題を）持ち出す／育てる", "He brought up the issue at the meeting.", "彼は会議でその問題を持ち出しました。"]]},
  "deal with": {"jp": "〜に対処する", "ref": "deal-with", "senses": [["To take action to handle a person, task, or problem.", "〜に対処する", "Let us deal with one problem at a time.", "一度に一つずつ問題に対処しましょう。"]]},
  "depend on": {"jp": "〜に頼る／〜次第である", "ref": "depend-on", "senses": [["To rely on something or be determined by it.", "〜に頼る／〜次第である", "Our plans depend on the weather.", "私たちの予定は天気次第です。"]]},
  "be used to": {"jp": "〜に慣れている", "ref": "be-used-to", "senses": [["To be familiar with something through experience. Use a noun or an -ing form after to.", "〜に慣れている", "I am used to working at night.", "夜に働くことに慣れています。"]]},
  "used to": {"jp": "以前は〜していた", "ref": "used-to", "senses": [["To describe a past habit or state that is no longer true. Follow with the base form of a verb.", "以前は〜していた", "I used to walk to school.", "以前は歩いて学校に通っていました。"]]},
  "in spite of": {"jp": "〜にもかかわらず", "ref": "in-spite-of", "senses": [["Despite the fact or situation named after the expression.", "〜にもかかわらず", "We enjoyed the trip in spite of the rain.", "雨にもかかわらず旅行を楽しみました。"]]},
};

export function normalizeExpression(value: string) {
  return value.normalize("NFKC").replace(/[’‘]/g, "'").trim().replace(/\s+/g, " ");
}

export function phraseEntry(value: string) {
  const input = normalizeExpression(value).toLowerCase();
  const word = Object.prototype.hasOwnProperty.call(aliases, input) ? aliases[input] : input;
  const note = Object.prototype.hasOwnProperty.call(notes, word) ? notes[word] : undefined;
  if (!note) return corpusEntry(word);
  return {
    word, jp: note.jp, phonetics: [], source: "アプリの熟語学習ノート",
    sourceUrls: [note.ref ? reference + note.ref : "https://dictionary.cambridge.org/search/english/direct/?q=" + encodeURIComponent(word)],
    meanings: [
      { partOfSpeech: "phrase / idiom", definitions: note.senses.map(([definition, jp, example, exampleJP]) => ({ definition, jp, example, exampleJP })) },
      // Keep existing corpus senses accessible when a new learning note enriches an entry.
      ...(Object.prototype.hasOwnProperty.call(learningNotes.notes, word) ? corpusEntry(word)?.meanings || [] : []),
    ],
  };
}

// Explicit aliases only: no speculative replacement of arbitrary sentences.
const aliases: Record<string, string> = {
  ...learningNotes.aliases,
  "has a crush on": "have a crush on", "had a crush on": "have a crush on",
  "have a crush on someone": "have a crush on", "have a crush on somebody": "have a crush on", "have a crush on sb": "have a crush on",
  "has a soft spot for": "have a soft spot for", "had a soft spot for": "have a soft spot for",
  "fell in love with": "fall in love with", "fallen in love with": "fall in love with", "falling in love with": "fall in love with", "falls in love with": "fall in love with",
  "am in love with": "be in love with", "is in love with": "be in love with", "are in love with": "be in love with", "was in love with": "be in love with", "were in love with": "be in love with",
  "went out with": "go out with", "going out with": "go out with", "gone out with": "go out with",
  "dealt with": "deal with",
  "gave up": "give up", "given up": "give up", "giving up": "give up",
  "looked up": "look up", "looking up": "look up", "looked after": "look after", "looking for": "look for",
  "looked forward to": "look forward to", "looking forward to": "look forward to",
  "ran out of": "run out of", "running out of": "run out of",
  "came up with": "come up with", "coming up with": "come up with",
  "took off": "take off", "taken off": "take off", "taking off": "take off",
  "broke down": "break down", "broken down": "break down", "brought up": "bring up",
  "am used to": "be used to", "is used to": "be used to", "are used to": "be used to",
};

function distance(a: string, b: string) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < b.length; j++) next.push(Math.min(next[j] + 1, row[j + 1] + 1, row[j] + (a[i] === b[j] ? 0 : 1)));
    row = next;
  }
  return row[b.length];
}

export function phraseSuggestions(value: string) {
  const query = normalizeExpression(value).toLowerCase();
  if (!query || query.length > 100) return [];
  const words = new Set([...Object.keys(notes), ...corpusWords]);
  return [...words].map(word => {
    const note = Object.prototype.hasOwnProperty.call(notes, word) ? notes[word] : undefined;
    const score = word === query || aliases[query] === word ? 100 :
      word.startsWith(query) ? 80 : word.includes(query) || note?.jp.includes(query) ? 60 :
      query.length >= 5 && distance(query, word) <= 2 ? 40 : 0;
    return { word, jp: note?.jp || "英語辞書の表現", score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.word.localeCompare(b.word)).slice(0, 6)
    .map(({ word, jp }) => ({ word, jp }));
}
