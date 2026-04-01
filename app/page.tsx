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

  try{
    await fetch("/api/history",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        query:word,
        mode:"word"
      })
    });

    const res = await fetch("/api/history");
    const data = await res.json();
    setHistory(data.slice(0,5));

  }catch(err){
    console.error(err);
  }

  // 🔥 最後に遷移
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

<main className="flex flex-col items-center justify-center min-h-screen px-4">

  <div className="flex flex-col items-center gap-8 w-full max-w-md">

    <h1 className="text-4xl font-bold text-center">
      📘 English Dictionary
    </h1>

    <div className="flex gap-2 w-full">

      <input
        value={word}
        onChange={(e)=>setWord(e.target.value)}
        placeholder="Search word..."
        className="border p-3 rounded w-full"
        onKeyDown={(e)=>{
          if(e.key === "Enter"){
            e.preventDefault();
            search();
          }
        }}
      />

      <button
        onClick={() => search()}
        className="bg-blue-500 text-white px-4 rounded whitespace-nowrap"
      >
        Search
      </button>

    </div>

    <div className="flex flex-col items-center w-full">

      <h3 className="font-semibold mb-2">
        Recent Searches
      </h3>

      <div className="space-y-1 text-center w-full">

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

  </div>

</main>

);
}