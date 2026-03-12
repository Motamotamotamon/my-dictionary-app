"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id:number
  content:string
  meaning?:string
  partOfSpeech?:string
  jp?:string
  book?:string
}

export default function VocabularyPage(){

  const [items,setItems] = useState<Item[]>([]);

  useEffect(()=>{

    const load = async ()=>{

      const res = await fetch("/api/saved");
      const saved = await res.json();

      const enriched = await Promise.all(

        saved.map(async (w:any)=>{

          const r = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${w.content}`
          );

          const d = await r.json();

          const meaning =
            d?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

          const partOfSpeech =
            d?.[0]?.meanings?.[0]?.partOfSpeech;

          let jp = "";

          try{

            const tr = await fetch(
              `https://api.mymemory.translated.net/get?q=${w.content}&langpair=en|ja`
            );

            const trData = await tr.json();

            jp = trData?.responseData?.translatedText;

          }catch{
            jp="";
          }

          return {
            ...w,
            meaning,
            partOfSpeech,
            jp
          };

        })

      );

      setItems(enriched);

    };

    load();

  },[]);


  // 発音
  const speak = (word:string)=>{

    const uttr = new SpeechSynthesisUtterance(word);
    uttr.lang = "en-US";
    speechSynthesis.speak(uttr);

  };


  // remove
  const removeWord = async (word:string) => {

    await fetch(`/api/saved?content=${word}`,{
      method:"DELETE"
    });

    setItems(items.filter(i => i.content !== word));

  };


  // 単語帳分類
  const moveBook = async (word:string,book:string)=>{

    await fetch("/api/saved",{
      method:"PATCH",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        content:word,
        book:book
      })
    });

    setItems(items.map(i=>
      i.content===word ? {...i,book:book} : i
    ));

  };


  return(

    <main className="max-w-xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        📚 Vocabulary
      </h1>


      {items.map(item=>(

        <div
          key={item.id}
          className="border p-4 mb-4 rounded"
        >

          <div className="flex items-center gap-2">

            <Link href={`/search/${item.content}`}>
              <h2 className="text-xl font-bold">
                {item.content}
              </h2>
            </Link>

            <button
              onClick={()=>speak(item.content)}
              style={{fontSize:18}}
            >
              🔊
            </button>

          </div>


          {item.jp && (
            <p style={{color:"#2563eb"}}>
              🇯🇵 {item.jp}
            </p>
          )}


          <p>{item.meaning}</p>

          <p className="text-gray-500">
            {item.partOfSpeech}
          </p>


          {item.book && (
            <p style={{color:"green"}}>
              📚 {item.book}
            </p>
          )}


          <div style={{marginTop:10}}>

            <button
              onClick={() => removeWord(item.content)}
              style={{ color:"red",marginRight:10 }}
            >
              Remove
            </button>

            <button
              onClick={()=>moveBook(item.content,"Book1")}
              style={{marginRight:10}}
            >
              Book1
            </button>

            <button
              onClick={()=>moveBook(item.content,"Book2")}
            >
              Book2
            </button>

          </div>

        </div>

      ))}

    </main>

  );

}