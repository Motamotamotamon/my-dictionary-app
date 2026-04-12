"use client";

import { useEffect, useState } from "react";

type Props = {
  word: string;
  jpWord: string;
  phonetic?: string;
  meanings: any[];
};

export default function SaveButton({
  word,
  jpWord,
  phonetic,
  meanings
}: Props){

  const [isSaved,setIsSaved] = useState(false);
  const [showBooks,setShowBooks] = useState(false);
  const [animate,setAnimate] = useState<"idle" | "big" | "small">("idle");

  // -----------------------
  // 保存チェック
  // -----------------------
  useEffect(()=>{

    const checkSaved = async ()=>{

      try{
        const res = await fetch("/api/saved");
        const data = await res.json();

        const found = data.some((i:any)=>i.content === word);
        setIsSaved(found);

      }catch(err){
        console.error("save check error",err);
      }

    };

    if(word) checkSaved();

  },[word]);

  // -----------------------
  // 保存
  // -----------------------
  const saveWord = async (book:string)=>{

    try{

      await fetch("/api/saved",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          content: word,
          jp: jpWord,
          phonetic: phonetic,
          meanings: meanings,
          book: book || "Unsorted"
        })
      });

      setIsSaved(true);
      setShowBooks(false);

      // アニメーション
      setAnimate("big");
      setTimeout(()=>setAnimate("small"),300);
      setTimeout(()=>setAnimate("idle"),800);

    }catch(err){
      console.error("save error",err);
    }

  };

  // -----------------------
  // 削除
  // -----------------------
  const removeWord = async () => {

    await fetch(`/api/saved?content=${word}`,{
      method:"DELETE"
    });

    setIsSaved(false);

  };

  // -----------------------
  // クリック
  // -----------------------
  const handleClick = async () => {

    if(isSaved){
      await removeWord();
    }else{
      setShowBooks(true);
    }

  };

  return(

    <div className="space-y-2">

      <button
        onClick={handleClick}
        style={{
          transform:
            animate === "big"
              ? "scale(1.12)"
              : animate === "small"
              ? "scale(0.97)"
              : "scale(1)"
        }}
        className={`
          px-4 py-2 rounded-xl border
          transition-all duration-500 ease-out
          ${isSaved 
            ? "bg-yellow-400 text-white border-yellow-400"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        `}
      >
        {isSaved ? "★ Saved" : "☆ Save"}
      </button>

      {showBooks && !isSaved && (

        <div className="flex gap-2">

          <button
            onClick={()=>saveWord("Book1")}
            className="px-3 py-1 border rounded"
          >
            📘 Book1
          </button>

          <button
            onClick={()=>saveWord("Book2")}
            className="px-3 py-1 border rounded"
          >
            📗 Book2
          </button>

          <button
            onClick={()=>saveWord("Unsorted")}
            className="px-3 py-1 border rounded"
          >
            📂 Unsorted
          </button>

        </div>

      )}

    </div>

  );

}