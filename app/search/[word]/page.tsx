"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function WordDetail() {

  const params = useParams();
  const word = params.word as string;

  const [data, setData] = useState<any>(null);
  const [jpWord, setJpWord] = useState("");
  const [jpDefinitions, setJpDefinitions] = useState<any>({});
  const [isSaved,setIsSaved] = useState(false);
  const [animate,setAnimate] = useState<"idle" | "big" | "small">("idle");
  const [related,setRelated] = useState<any[]>([]);
  const [synonyms,setSynonyms] = useState<any[]>([]);
  const [antonyms,setAntonyms] = useState<any[]>([]);
  const [examples,setExamples] = useState<any[]>([]);
  const [explain,setExplain] = useState<any>(null);
  const [showBooks,setShowBooks] = useState(false);
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

  // -----------------------
  // 定義翻訳
  // -----------------------

  const translateDefinition = async (text:string) => {
    // 🔥 すでに翻訳済みならスキップ
  if(jpDefinitions[text]) return;

  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${text}&langpair=en|ja`
  );

  const data = await res.json();

  // ⭐ definitions用
  setJpDefinitions((prev:any)=>({
    ...prev,
    [text]: data.responseData.translatedText
  }));

  // ⭐ explanation用
  setJpExplain((prev:any)=>({
    ...prev,
    [text]: data.responseData.translatedText
  }));

};

  // -----------------------
  // 単語翻訳
  // -----------------------

  const translateWord = async (word:string) => {

    try {

      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${word}&langpair=en|ja`
      );

      const data = await res.json();

      setJpWord(data.responseData.translatedText);

    } catch(err) {

      console.error(err);

    }

  };

  // -----------------------
  // 辞書取得
  // -----------------------

  useEffect(()=>{

    const fetchWord = async ()=>{

      try{

        // ⭐並列API
        const [synRes,antRes,dictRes,relRes] = await Promise.all([

          fetch(`https://api.datamuse.com/words?rel_syn=${word}`),
          fetch(`https://api.datamuse.com/words?rel_ant=${word}`),
          fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`),
          fetch(`https://api.datamuse.com/words?ml=${word}`)

        ]);

        const synData = await synRes.json();
        const antData = await antRes.json();
        const json = await dictRes.json();
        const relData = await relRes.json();

        setSynonyms(synData.slice(0,6));
        setAntonyms(antData.slice(0,6));
        setRelated(relData.slice(0,8));

        if(Array.isArray(json)){
          setData(json);
        }else{
          setData([]);
        }

        // 単語翻訳
        translateWord(word);

        // ⭐ 全definition翻訳
if(Array.isArray(json)){

  json[0]?.meanings?.forEach((m:any)=>{

    m.definitions.forEach((d:any)=>{

      if(d.definition){
        translateDefinition(d.definition);
      }

    });

  });

}

        // ⭐AI examples
if(examples.length === 0){

  try{

    const ex = await fetch("/api/example",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({word})
    });

    const exData = await ex.json();

    if(Array.isArray(exData)){
      setExamples(exData);
    }

  }catch(err){

    console.error("AI example error",err);

  }

}

// ⭐AI explanation
try{

  const res = await fetch("/api/explain",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({word})
  });

  const data = await res.json();

  setExplain(data);
  // ⭐ AI explanation翻訳
if(data?.meaning){
  translateDefinition(data.meaning);
}
if(data?.nuance){
  translateDefinition(data.nuance);
}

}catch(err){

  console.error("AI explain error",err);

}

      }catch(err){

        console.error("fetch word error",err);

      }

    };

    if(word) fetchWord();

  },[word]);

  // -----------------------
  // 保存チェック
  // -----------------------

  useEffect(()=>{

    const checkSaved = async ()=>{

      try{

        const res = await fetch("/api/saved");
        const data = await res.json();

        const found = data.some((i:any)=>i.content === word);

        setIsSaved(found);

      }catch(err){

        console.error("save check error",err);

      }

    };

    if(word) checkSaved();

  },[word]);


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

  // 🔥 変更点だけじゃなく全部コピペOK

const saveWord = async (book?:string)=>{

  try{

    await fetch("/api/saved",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        content:word,
        jp:jpWord,
        book:book || "Unsorted",
        phonetic: phonetic,
        meanings: buildMeanings()
      })
    });

    setIsSaved(true);
    setShowBooks(false);

    // 👇ここに追加
    console.log("animate start");

    setAnimate("big");

    setTimeout(()=>{
      console.log("animate small");
      setAnimate("small");
    },300);

    setTimeout(()=>{
      console.log("animate idle");
      setAnimate("idle");
    },800);

  }catch(err){
    console.error("save error",err);
  }

};
const removeWord = async () => {

  await fetch(`/api/saved?content=${word}`, {
    method: "DELETE"
  });

  setIsSaved(false);
};

const toggleSave = async () => {

  if (isSaved) {
    await removeWord();
  } else {
    setShowBooks(true);
  }

};
  if(!data) return <div className="p-10">Loading...</div>;

  if(data.length === 0){
    return (
      <div className="p-10 text-center">
        <p className="text-xl">Word not found</p>
      </div>
    );
  }

  return (

    <div className="max-w-2xl mx-auto p-6 space-y-6">

      <div>

        <h1 className="text-4xl font-bold flex items-center gap-3">

          {word}

          {audio && (
            <button
              onClick={playAudio}
              className="text-2xl"
            >
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

      <div className="space-y-2">

<button
  onClick={toggleSave}
  style={{
  transform:
    animate === "big"
      ? "scale(1.12)"
      : animate === "small"
      ? "scale(0.97)"
      : "scale(1)"
}}
  className={`
    px-4 py-2 rounded-xl border
    transition-all duration-500 ease-out
    ${isSaved 
      ? "bg-yellow-400 text-white border-yellow-400"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }
  `}
>
  {isSaved ? "★ Saved" : "☆ Save"}
</button>

{showBooks && !isSaved && (

  <div className="flex gap-2 mt-3">
    <button onClick={() => saveWord("Book1")} className="px-3 py-1 border rounded">
      📘 Book1
    </button>

    <button onClick={() => saveWord("Book2")} className="px-3 py-1 border rounded">
      📗 Book2
    </button>

    <button onClick={() => saveWord("Unsorted")} className="px-3 py-1 border rounded">
      📂 Unsorted
    </button>
  </div>

)}

</div>


      {/* meanings */}

      {data[0]?.meanings?.map((m:any,i:number)=>(

        <div key={i}>

          <h3 className="text-xl font-semibold mb-2">
            {m.partOfSpeech}
          </h3>

          {m.definitions.map((d:any,j:number)=>(

            <div key={j} className="mb-4">

              <p>• {d.definition}</p>

              {jpDefinitions[d.definition] && (

                <p className="text-blue-600 ml-4">

                  → {jpDefinitions[d.definition]}

                </p>

              )}

            </div>

          ))}

        </div>

      ))}

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

    </div>

  );

}