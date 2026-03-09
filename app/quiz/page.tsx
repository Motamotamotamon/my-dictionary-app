"use client";

import { useEffect,useState } from "react";

export default function Quiz(){

  const [word,setWord] = useState<any>(null);

  useEffect(()=>{

    const load = async ()=>{

      const res = await fetch("/api/saved");
      const words = await res.json();

      if(words.length === 0) return;

      const random =
        words[Math.floor(Math.random()*words.length)];

      setWord(random.content);

    };

    load();

  },[]);

  if(!word) return <div>No saved words</div>;

  return(

    <div className="flex flex-col items-center p-10">

      <h1 className="text-3xl mb-6">
        What does this word mean?
      </h1>

      <h2 className="text-4xl font-bold mb-6">
        {word}
      </h2>

      <p>Think about the meaning!</p>

    </div>

  );
}