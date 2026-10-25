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

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isSaved,setIsSaved] = useState(false);
  const [showBooks,setShowBooks] = useState(false);
  const [animate,setAnimate] = useState<"idle" | "big" | "small">("idle");

  // -----------------------
  // 保存チェック
  // -----------------------
  useEffect(()=>{

    let active = true;
    setIsSaved(false);
    const checkSaved = async ()=>{

      try{
        const res = await fetch("/api/saved", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error("保存状態を確認できませんでした。");
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("保存状態を確認できませんでした。");
        const found = data.some((i:any)=>i.content === word);
        if (active) setIsSaved(found);

      }catch(err){
        console.error("save check error",err);
      }

    };

    if(word) checkSaved();
    return () => { active = false; };

  },[word]);

  // -----------------------
  // 保存
  // -----------------------
  const saveWord = async (book:string)=>{
    if (busy) return;
    setBusy(true);
    setError("");
    try{

      const res = await fetch("/api/saved",{
        signal: AbortSignal.timeout(15000),
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

      if (!res.ok) throw new Error("保存できませんでした。もう一度お試しください。");
      const saved = await res.json();
      if (!saved?.id || saved.content !== word || saved.book !== book) throw new Error("保存結果を確認できませんでした。");
      setIsSaved(true);
      setShowBooks(false);

      // アニメーション
      setAnimate("big");
      setTimeout(()=>setAnimate("small"),300);
      setTimeout(()=>setAnimate("idle"),800);

    }catch(err){
      setError("保存できませんでした。もう一度お試しください。");
    } finally {
      setBusy(false);
    }

  };

  // -----------------------
  // 削除
  // -----------------------
  const removeWord = async () => {

    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/saved?content=${encodeURIComponent(word)}`, {
        method: "DELETE", signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error("Delete failed");
      setIsSaved(false);
    } catch {
      setError("保存の解除に失敗しました。もう一度お試しください。");
    } finally {
      setBusy(false);
    }

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
        disabled={busy}
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
        {busy ? "処理中…" : isSaved ? "★ Saved" : "☆ Save"}
      </button>

      {error && <p role="alert" className="text-red-600">{error}</p>}

      {showBooks && !isSaved && (

        <div className="flex gap-2">

          <button
        disabled={busy}
            onClick={()=>saveWord("Book1")}
            className="px-3 py-1 border rounded"
          >
            📘 Book1
          </button>

          <button
        disabled={busy}
            onClick={()=>saveWord("Book2")}
            className="px-3 py-1 border rounded"
          >
            📗 Book2
          </button>

          <button
        disabled={busy}
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