"use client";

import { useEffect,useState } from "react";
import Link from "next/link";

export default function SavedPage(){

  const [words,setWords] = useState<any[]>([]);

  useEffect(()=>{

    const fetchWords = async ()=>{

      const res = await fetch("/api/saved");
      const data = await res.json();

      setWords(data);

    };

    fetchWords();

  },[]);

  return(

    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Saved Words
      </h1>

      {words.map((w,i)=>(
        
        <Link
          key={i}
          href={`/word/${w.content}`}
          className="block border p-3 mb-2 rounded"
        >
          {w.content}
        </Link>

      ))}

    </div>

  );
}