"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const [word,setWord] = useState("");
  const router = useRouter();

  const search = () => {
    if(!word) return;
    router.push(`/word/${word}`);
  };

  return (

    <div className="flex flex-col items-center justify-center h-screen gap-6">

      <h1 className="text-4xl font-bold">
        English Dictionary
      </h1>

      <input
        value={word}
        onChange={(e)=>setWord(e.target.value)}
        placeholder="Search word..."
        className="border p-3 rounded w-64"
      />

      <button
        onClick={search}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Search
      </button>

    </div>

  );
}