"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function WordDetail() {

  const params = useParams();
  const word = params.word as string;

  const [data, setData] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [jpWord, setJpWord] = useState("");
  const [jpDefinitions, setJpDefinitions] = useState<any>({});

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

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      const json = await res.json();

      setData(json);

      // 単語翻訳
      translateWord(word);

      // 意味翻訳
      json?.[0]?.meanings?.forEach((m:any)=>{

        m.definitions.forEach((d:any)=>{

          translateDefinition(d.definition);

        });

      });

    };

    if(word) fetchWord();

  },[word]);

  // -----------------------
  // 保存チェック
  // -----------------------

  useEffect(()=>{

    const checkSaved = async ()=>{

      const res = await fetch("/api/saved");

      const items = await res.json();

      const exists = items.some(
        (item:any)=>item.content === word
      );

      setSaved(exists);

    };

    if(word) checkSaved();

  },[word]);

  const toggleSave = async ()=>{

    if(!saved){

      await fetch("/api/saved",{

        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          content:word
        })

      });

      setSaved(true);

    }else{

      await fetch(`/api/saved?content=${word}`,{
        method:"DELETE"
      });

      setSaved(false);

    }

  };

  if(!data) return <div className="p-10">Loading...</div>;

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
        className="text-lg border px-4 py-2 rounded"
      >
        {saved ? "★ Saved" : "☆ Save"}
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

      {/* example */}

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

    </div>

  );

}