"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Home() {

  const [word,setWord] = useState("");
  const [history,setHistory] = useState<any[]>([]);
  const router = useRouter();
  const params = useSearchParams();
  const search = async () => {

  if(!word.trim()) return;

  await fetch("/api/history",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
  query:word,
  mode:"word"
})
  });

  // 履歴再取得
  const res = await fetch("/api/history");
  const data = await res.json();
  setHistory(prev=>{
  const filtered = prev.filter(h=>h.query !== word)
  return [{query:word},...filtered].slice(0,5)
})

  router.push(`/search/${word}`);

};
  useEffect(()=>{

  const w = params.get("word");

  if(w){
    setWord(w);
    router.push(`/search/${w}`);
  }

  const loadHistory = async ()=>{

    const res = await fetch("/api/history");
    const data = await res.json();

    console.log("history",data);   // ←追加

    setHistory(data.slice(0,5));

  };

  loadHistory();

},[]);

  return (

<main className="flex flex-col items-center justify-center min-h-screen gap-8">

  <h1 className="text-4xl font-bold">
    📘 English Dictionary
  </h1>

  <div className="flex gap-2">

    <input
      value={word}
      onChange={(e)=>setWord(e.target.value)}
      placeholder="Search word..."
      className="border p-3 rounded w-72"
      onKeyDown={(e)=>{
        if(e.key === "Enter"){
          e.preventDefault();
          search();
        }
      }}
    />

    <button
      onClick={() => search()}
      className="bg-blue-500 text-white px-4 rounded"
    >
      Search
    </button>

  </div>

  <div className="flex flex-col items-center mt-6">

    <h3 className="font-semibold mb-2">
      Recent Searches
    </h3>

    <div className="space-y-1 text-center">

      {history.map((h,i)=>(

        <div
          key={i}
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={()=>router.push(`/search/${h.query}`)}
        >
          {h.query}
        </div>

      ))}

    </div>

  </div>

</main>

);
}