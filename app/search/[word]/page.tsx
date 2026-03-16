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
  const [related,setRelated] = useState<any[]>([]);
  const [synonyms,setSynonyms] = useState<any[]>([]);
  const [antonyms,setAntonyms] = useState<any[]>([]);
  const [examples,setExamples] = useState<any[]>([]);
  const [explain,setExplain] = useState<any>(null);

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

    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${text}&langpair=en|ja`
    );

    const data = await res.json();

    setJpDefinitions((prev:any)=>({
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

        // 意味翻訳
        const firstDef = json?.[0]?.meanings?.[0]?.definitions?.[0];

        if(firstDef){
          translateDefinition(firstDef.definition);
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

  const toggleSave = async ()=>{

    try{

      if(isSaved){

        await fetch(`/api/saved?content=${word}`,{
          method:"DELETE"
        });

        setIsSaved(false);

      }else{

        await fetch("/api/saved",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            content:word,
            type:"word",
            jp:jpWord
          })
        });

        setIsSaved(true);

      }

    }catch(err){

      console.error("save error",err);

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

      <button
        onClick={toggleSave}
        className="border px-4 py-2 rounded"
      >
        {isSaved ? "⭐ Saved" : "☆ Save"}
      </button>

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
</p>

<p className="mb-2">
<span className="font-semibold">Nuance:</span>
<br/>
{explain.nuance}
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

          <div className="flex flex-wrap gap-3 mt-3">

            {related.map((r:any,i:number)=>(

              <Link
                key={i}
                href={`/search/${r.word}`}
                className="px-3 py-1 bg-gray-100 rounded-full hover:bg-blue-100 border text-sm"
              >
                {r.word}
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

          <div className="flex flex-wrap gap-2 mt-2">

            {synonyms.map((s:any,i:number)=>(

              <Link
                key={i}
                href={`/search/${s.word}`}
                className="px-3 py-1 bg-green-100 rounded-full border hover:bg-green-200 text-sm"
              >
                {s.word}
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

          <div className="flex flex-wrap gap-2 mt-2">

            {antonyms.map((a:any,i:number)=>(

              <Link
                key={i}
                href={`/search/${a.word}`}
                className="px-3 py-1 bg-red-100 rounded-full border hover:bg-red-200 text-sm"
              >
                {a.word}
              </Link>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}