"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VocabularyCard from "@/components/VocabularyCard";

type Item = {
  id:number
  content:string
  meanings?:any[]
  phonetic?:string
  book?:string
}

export default function VocabularyPage(){

  const [items,setItems] = useState<Item[]>([]);
  const [open,setOpen] = useState<{[key:string]:boolean}>({});
  const [translations,setTranslations] = useState<{[key:string]: string}>({});
  const [activeTab, setActiveTab] = useState("Book1");
  const router = useRouter();

  useEffect(()=>{

  const load = async ()=>{

    try{

      const res = await fetch("/api/saved");
      const data = await res.json();

      console.log("saved data", data); // 🔍 デバッグ

      // 🔥 ここが重要
      if(Array.isArray(data)){
        setItems(data);
      }else{
        setItems([]); // エラー回避
      }

    }catch(err){
      console.error(err);
      setItems([]);
    }

  };

  load();
  // 👇これ追加
  const handleFocus = () => load();
  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("focus", handleFocus);
  };

},[]);



  const translate = async (text:string)=>{

    const res = await fetch("/api/translate",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({text})
    });

    const data = await res.json();

    return data.jp;

  };



  const toggle = async (word:string)=>{

    const isOpen = !open[word];

    setOpen(prev => ({
  ...prev,
  [word]: isOpen
}));

    if(!isOpen) return;

    const item = items.find(i=>i.content===word);

    if(!item?.meanings) return;

    const newTranslations:any = {...translations};

    for(let i=0;i<item.meanings.length;i++){

      const defs = item.meanings[i].definitions.slice(0,2);

      for(let j=0;j<defs.length;j++){

        const key = `${word}-${i}-${j}`;

        if(!newTranslations[key]){

          const jp = await translate(defs[j].definition);

          newTranslations[key] = jp;

        }

      }

    }

    setTranslations(newTranslations);

  };


  const speak = (word:string)=>{

    const uttr = new SpeechSynthesisUtterance(word);
    uttr.lang = "en-US";
    speechSynthesis.speak(uttr);

  };


  const goDetail = (word:string)=>{
  router.push(`/search/${word}`);
};


  const removeWord = async (word:string) => {

  await fetch(`/api/saved?content=${word}`,{
    method:"DELETE"
  });

  const res = await fetch("/api/saved");
  const data = await res.json();

  if(Array.isArray(data)){
    setItems(data);
  }
};

  const updateBook = async (word:string,book:string)=>{

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

    setItems(items.map(i =>
  i.content === word ? { ...i, book } : i
));

setActiveTab(book); // 👈追加

  };


  const book1 = items.filter(i => i.book === "Book1");
  const book2 = items.filter(i => i.book === "Book2");
  const others = items.filter(i => !i.book || i.book === "Unsorted");

  let currentItems: Item[] = [];

if (activeTab === "Book1") currentItems = book1;
if (activeTab === "Book2") currentItems = book2;
if (activeTab === "Unsorted") currentItems = others;

  return(

    <main className="max-w-xl mx-auto p-6 pb-20">

      <h1 className="text-3xl font-bold mb-6">
        📚 Vocabulary
      </h1>

      {/* 🔥 タブUI */}
<div className="flex gap-2 mb-6 justify-center">

  <button
    onClick={() => {
  setActiveTab("Book1");
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
      activeTab === "Book1"
        ? "bg-blue-500 text-white"
        : "bg-white"
    }`}
  >
    📘 Book1 ({book1.length})
  </button>

  <button
    onClick={() => {
  setActiveTab("Book2");
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
      activeTab === "Book2"
        ? "bg-green-500 text-white"
        : "bg-white"
    }`}
  >
    📗 Book2 ({book2.length})
  </button>

  <button
    onClick={() => {
  setActiveTab("Unsorted");
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
      activeTab === "Unsorted"
        ? "bg-gray-500 text-white"
        : "bg-white"
    }`}
  >
    📂 Others ({others.length})
  </button>

</div>

{/* 🔥 表示部分 */}
{currentItems.length === 0 && (
  <p className="text-gray-400 text-center mt-10">
  No words yet 📭
</p>
)}

{currentItems.map(item => (
  <VocabularyCard
    key={item.id}
    item={item}
    open={open}
    toggle={toggle}
    speak={speak}
    goDetail={goDetail}
    removeWord={removeWord}
    updateBook={updateBook}
    translations={translations}
  />
))}

    </main>

  );

}