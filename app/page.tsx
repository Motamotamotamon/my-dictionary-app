"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const [word,setWord] = useState("");
  const [history,setHistory] = useState<any[]>([]);
  const router = useRouter();

  const search = () => {
    const query = word.trim().replace(/\s+/g, " ");
    if (!query) return;
    router.push(`/search/${encodeURIComponent(query)}`);
    // History is optional and must never delay navigation.
    void fetch("/api/history", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, mode: "word" }), keepalive: true,
      signal: AbortSignal.timeout(10000),
    }).catch(err => console.error("history save error", err));
  };

  useEffect(()=>{


    const loadHistory = async ()=>{

      try{
        const res = await fetch("/api/history");
        const data = await res.json();



        if(Array.isArray(data)){
          setHistory(data.slice(0,5));
        }else{
          setHistory([]);
        }

      }catch(err){
        console.error("history load error", err);
        setHistory([]);
      }

    };

    loadHistory();

  },[]);

  return (

<main className="flex flex-col items-center justify-center min-h-screen px-4 pb-20">

  <div className="flex flex-col items-center gap-8 w-full max-w-md">

    <h1 className="text-4xl font-bold text-center">
      📘 English Dictionary
    </h1>

    <div className="flex gap-2 w-full">

      <input
        value={word}
        onChange={(e)=>setWord(e.target.value)}
        placeholder="単語・熟語を検索（例：go out with）"
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

    {/* 🔥 履歴UI 改善版 */}
    {history.length > 0 && (

      <div className="flex flex-col items-center w-full">

        <h3 className="font-semibold mb-3">
          🕘 Recent Searches
        </h3>

        <div className="flex flex-wrap gap-2 justify-center">

          {history.map((h,i)=>(
            <button
              key={i}
              onClick={()=>router.push(`/search/${encodeURIComponent(h.query)}`)}
              className={`
                px-3 py-1 rounded-full text-sm border transition

                ${i === 0 
                  ? "bg-blue-500 text-white border-blue-500 font-semibold"
                  : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              {h.query}
              <span className="ml-1 text-xs opacity-70">
                ({h.mode})
              </span>
            </button>
          ))}

        </div>

      </div>

    )}

  </div>

</main>

);
}