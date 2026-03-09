"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {

  const [word,setWord] = useState("");
  const [history,setHistory] = useState<string[]>([]);
  const router = useRouter();

  const search = async () => {

    if(!word.trim()) return;

    // 履歴保存
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

    <main className="flex flex-col items-center mt-32 gap-8">

      <h1 className="text-4xl font-bold">
        📘 English Dictionary
      </h1>

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

      <div className="flex gap-4">

        <Link href="/saved" className="border px-4 py-2 rounded">
          ⭐ Saved
        </Link>

        <Link href="/vocabulary" className="border px-4 py-2 rounded">
          📚 Vocabulary
        </Link>

        <Link href="/quiz" className="border px-4 py-2 rounded">
          🧠 Quiz
        </Link>

      </div>

      <div className="mt-8">

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