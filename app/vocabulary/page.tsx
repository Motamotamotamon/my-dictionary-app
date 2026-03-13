"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WordCard from "@/components/WordCard";

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
  const book1 = items.filter(i => i.book === "Book1");
  const book2 = items.filter(i => i.book === "Book2");
  const others = items.filter(i => !i.book);


  return(

    <main className="max-w-xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        📚 Vocabulary
      </h1>


      {/* 未分類 */}
<h2 className="text-xl font-bold mt-6 mb-2">
📦 Unsorted
</h2>

{others.map(item=>(
  <WordCard
    key={item.id}
    word={item.content}
    definition={item.meaning}
    partOfSpeech={item.partOfSpeech}
    jp={item.jp}
    onRemove={()=>removeWord(item.content)}
  />
))}

{/* Book1 */}
<h2 className="text-xl font-bold mt-6 mb-2">
📚 Book1
</h2>

{book1.map(item=>(
  <WordCard
    key={item.id}
    word={item.content}
    definition={item.meaning}
    partOfSpeech={item.partOfSpeech}
    jp={item.jp}
    onRemove={()=>removeWord(item.content)}
  />
))}

{/* Book2 */}
<h2 className="text-xl font-bold mt-6 mb-2">
📚 Book2
</h2>

{book2.map(item=>(
  <WordCard
    key={item.id}
    word={item.content}
    definition={item.meaning}
    partOfSpeech={item.partOfSpeech}
    jp={item.jp}
    onRemove={()=>removeWord(item.content)}
  />
))}

    </main>

  );

}