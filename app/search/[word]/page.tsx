"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SaveButton from "@/components/SaveButton";

export default function WordDetail() {

  const params = useParams();
  const word = params.word as string;
  return <WordContent key={word} word={word} />;
}

function WordContent({ word }: { word: string }) {

  const [manualMeaning, setManualMeaning] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<any>(null);
  const [jpWord, setJpWord] = useState("");
  const [jpDefinitions, setJpDefinitions] = useState<any>({});
  const [related,setRelated] = useState<any[]>([]);
  const [synonyms,setSynonyms] = useState<any[]>([]);
  const [antonyms,setAntonyms] = useState<any[]>([]);
  const [examples,setExamples] = useState<any[]>([]);
  const [explain,setExplain] = useState<any>(null);
  const [jpExplain,setJpExplain] = useState<any>({});

  const audio =
    data?.[0]?.phonetics?.find((p:any)=>p.audio)?.audio;

  const phonetic =
    data?.[0]?.phonetics?.find((p:any)=>p.text)?.text;

  const example =
    data?.[0]?.meanings?.[0]?.definitions?.[0]?.example;

  const playAudio = () => {
    if (!audio) return;
    const sound = new Audio(audio);
    sound.play();
  };

  useEffect(() => {
    const controller = new AbortController();
    const active = () => !controller.signal.aborted;

    setLoading(true);
    setError("");
    setData(null);
    setJpWord("");
    setJpDefinitions({});
    setJpExplain({});
    setSynonyms([]);
    setAntonyms([]);
    setRelated([]);
    setExamples([]);
    setExplain(null);

    // Every request has its own deadline; cleanup also cancels all pending work.
    const request = async (url: string, init: RequestInit = {}) => {
      const timeout = AbortSignal.timeout(15000);
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.any([controller.signal, timeout]),
      });
      if (!response.ok) {
        throw new Error(response.status === 404 ? "not-found" : "request-failed");
      }
      return response.json();
    };

    const translate = async (text: string, isWord = false) => {
      try {
        const json = await request(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`
        );
        const translated = json?.responseData?.translatedText;
        if (!active() || json?.responseStatus !== 200 || typeof translated !== "string") return;
        if (isWord) {
          setJpWord(translated);
        } else {
          setJpDefinitions((prev: any) => ({ ...prev, [text]: translated }));
          setJpExplain((prev: any) => ({ ...prev, [text]: translated }));
        }
      } catch {
        // A translation failure must not hide the dictionary entry.
      }
    };

    const loadDictionary = async () => {
      try {
        const json = await request(`/api/dictionary?word=${encodeURIComponent(word)}`);
        if (!Array.isArray(json) || !json.length || !Array.isArray(json[0]?.meanings)) {
          throw new Error("invalid-response");
        }
        if (!active()) return;
        setData(json);
        if (json[0].jp) setJpWord(json[0].jp);
        else void translate(word, true);
        json[0].meanings.forEach((meaning: any) => {
          meaning.definitions?.forEach((definition: any) => {
            if (definition.jp) {
              setJpDefinitions((prev: any) => ({ ...prev, [definition.definition]: definition.jp }));
            } else if (definition.definition) void translate(definition.definition);
          });
        });
      } catch (err) {
        if (!active()) return;
        if (err instanceof Error && err.message === "not-found") {
          setData([]);
        } else {
          setError("辞書データを取得できませんでした。時間をおいて再試行してください。");
        }
      } finally {
        if (active()) setLoading(false);
      }
    };

    const loadRelated = async (
      relation: string,
      limit: number,
      update: (items: any[]) => void
    ) => {
      try {
        const json = await request(
          `https://api.datamuse.com/words?${relation}=${encodeURIComponent(word)}`
        );
        if (active() && Array.isArray(json)) update(json.slice(0, limit));
      } catch {
        // Related words are optional.
      }
    };

    const loadAI = async (kind: "example" | "explain") => {
      try {
        const json = await request(`/api/${kind}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word }),
        });
        if (!active()) return;
        if (kind === "example" && Array.isArray(json)) setExamples(json);
        if (kind === "explain" && typeof json?.meaning === "string") {
          setExplain(json);
          void translate(json.meaning);
          if (json.nuance) void translate(json.nuance);
        }
      } catch {
        // AI results are optional and never block dictionary rendering.
      }
    };

    if (!word) {
      setError("検索する単語を入力してください。");
      setLoading(false);
      return () => controller.abort();
    }

    void loadDictionary();
    void loadRelated("rel_syn", 6, setSynonyms);
    void loadRelated("rel_ant", 6, setAntonyms);
    void loadRelated("ml", 8, setRelated);
    void loadAI("example");
    void loadAI("explain");

    return () => controller.abort();
  }, [word, attempt]);

  // -----------------------
  // meanings整形
  // -----------------------

  const buildMeanings = () => {

    if(!data?.[0]?.meanings) return [];

    return data[0].meanings.map((m:any)=>({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.map((d:any)=>({
        definition: d.definition,
        example: d.example || ""
      }))
    }));

  };

  if (loading) return <div className="p-10" role="status">Loading...</div>;

  if (error) {
    return (
      <main className="p-10 text-center space-y-4">
        <p role="alert">{error}</p>
        <button
          onClick={() => setAttempt((value) => value + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          再試行
        </button>
        <div><Link href="/">検索画面に戻る</Link></div>
      </main>
    );
  }

  if(!data || data.length === 0){
    return (
      <div className="p-10 text-center">
        <p className="text-xl">辞書に見つかりませんでした</p>
        <p className="mt-3">「{word}」の日本語の意味を入力して、単語帳に保存できます。</p>
        <label className="block mt-4" htmlFor="manual-meaning">日本語の意味</label>
        <input id="manual-meaning" className="border rounded p-3 w-full mt-2" value={manualMeaning}
          onChange={(event) => setManualMeaning(event.target.value)} maxLength={500} placeholder="例：〜と付き合う" />
        {manualMeaning.trim() && <div className="mt-4"><SaveButton word={word} jpWord={manualMeaning.trim()} meanings={[]} /></div>}
      </div>
    );
  }

  return (

    <main className="max-w-2xl mx-auto p-6 space-y-6 pb-20">

      <div>

        <h1 className="text-4xl font-bold flex items-center gap-3">

          {word}

          {audio && (
            <button onClick={playAudio} className="text-2xl">
              🔊
            </button>
          )}

        </h1>

        {phonetic && (
          <p className="text-gray-500 mt-1">
            {phonetic}
          </p>
        )}

        {jpWord && (
          <p className="text-xl font-semibold mt-2">
            🇯🇵 {jpWord}
          </p>
        )}

      </div>

      {/* 🔥 SaveButtonに完全移行 */}
      <SaveButton
        word={word}
        jpWord={jpWord}
        phonetic={phonetic}
        meanings={buildMeanings()}
      />

      {data[0]?.source && <p className="text-sm text-gray-500">出典：{data[0].source}</p>}
      {/* meanings */}

      {data[0]?.meanings?.map((m:any,i:number)=>(

        <div key={i}>

          <h3 className="text-xl font-semibold mb-2">
            {m.partOfSpeech}
          </h3>

          {m.definitions.map((d:any,j:number)=>(

            <div key={j} className="mb-4">

              <p>• {d.definition}</p>
              {d.example && <p className="italic mt-2">{d.example}</p>}
              {d.exampleJP && <p className="text-blue-600">{d.exampleJP}</p>}

              {jpDefinitions[d.definition] && (
                <p className="text-blue-600 ml-4">
                  → {jpDefinitions[d.definition]}
                </p>
              )}

            </div>

          ))}

        </div>

      ))}

      {/* 以下そのまま（省略なしでOK） */}

      {/* Example */}

      {example && (

        <div>

          <h3 className="text-xl font-semibold">
            Example
          </h3>

          <p className="italic mt-2">
            {example}
          </p>

        </div>

      )}

      {/* AI Examples */}

      {examples.length > 0 && (

        <div>

          <h3 className="text-xl font-semibold mt-8">
            AI Examples
          </h3>

          <div className="space-y-4 mt-3">

            {examples.map((ex:any,i:number)=>(

              <div key={i} className="border p-3 rounded">

                <p className="font-medium">
                  {ex.en}
                </p>

                <p className="text-blue-600 text-sm mt-1">
                  → {ex.jp}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}
      {explain && (

<div className="mt-8 border p-4 rounded bg-yellow-50">

<h3 className="text-xl font-semibold mb-3">
AI Explanation
</h3>

<p className="mb-2">
<span className="font-semibold">Meaning:</span>
<br/>
{explain.meaning}
{jpExplain[explain.meaning] && (
  <p className="text-blue-600">
    → {jpExplain[explain.meaning]}
  </p>
)}
</p>

<p className="mb-2">
<span className="font-semibold">Nuance:</span>
<br/>
{explain.nuance}
{jpExplain[explain.nuance] && (
  <p className="text-blue-600">
    → {jpExplain[explain.nuance]}
  </p>
)}
</p>

<p className="mt-3">
<span className="font-semibold">Example:</span>
<br/>
{explain.example}
</p>

<p className="text-blue-600">
→ {explain.exampleJP}
</p>

</div>

)}

      {/* Related */}

      {related.length > 0 && (

        <div>

          <h3 className="text-xl font-semibold mt-8">
            Related words
          </h3>

          <div className="mt-4 space-y-2">

  {related.map((r:any,i:number)=>(

    <Link
      key={i}
      href={`/search/${r.word}`}
      className="flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-blue-50 transition"
    >
      <span>{r.word}</span>
      <span className="text-gray-400">→</span>
    </Link>

  ))}

</div>

        </div>

      )}

      {/* Synonyms */}

      {synonyms.length > 0 && (

        <div>

          <h3 className="text-xl font-semibold mt-8">
            Synonyms
          </h3>

          <div className="mt-4 space-y-2">

  {synonyms.map((s:any,i:number)=>(

    <Link
      key={i}
      href={`/search/${s.word}`}
      className="flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-blue-50 transition"
    >
      <span>{s.word}</span>
      <span className="text-gray-400">→</span>
    </Link>

  ))}

</div>

        </div>

      )}

      {/* Antonyms */}

      {antonyms.length > 0 && (

        <div>

          <h3 className="text-xl font-semibold mt-8">
            Antonyms
          </h3>

          <div className="mt-4 space-y-2">

  {antonyms.map((a:any,i:number)=>(

    <Link
      key={i}
      href={`/search/${a.word}`}
      className="flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-blue-50 transition"
    >
      <span>{a.word}</span>
      <span className="text-gray-400">→</span>
    </Link>

  ))}

</div>

        </div>

      )}

    </main>

  );

}