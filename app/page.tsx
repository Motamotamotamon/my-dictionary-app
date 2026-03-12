"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const [word,setWord] = useState("");
  const [history,setHistory] = useState<any[]>([]);
  const router = useRouter();

  const search = async () => {

    if(!word.trim()) return;

    await fetch("/api/history",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ query:word })
    });

    router.push(`/search/${word}`);
  };

  useEffect(()=>{

    const loadHistory = async ()=>{

      const res = await fetch("/api/history");
      const data = await res.json();

      setHistory(data.slice(0,5));

    };

    loadHistory();

  },[]);

  return (

    <main className="flex flex-col items-center justify-center h-[80vh] gap-8">

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
              search();
            }
          }}
        />

        <button
          onClick={search}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Search
        </button>

      </div>

      <div className="mt-6">

        <h3 className="font-semibold mb-2">
          Recent Searches
        </h3>

        {history.map((h,i)=>(
          <div
            key={i}
            className="cursor-pointer text-blue-600"
            onClick={()=>router.push(`/search/${h.query}`)}
          >
            {h.query}
          </div>
        ))}

      </div>

    </main>

  );
}