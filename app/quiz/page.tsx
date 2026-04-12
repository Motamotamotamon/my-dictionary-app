"use client";

import { useEffect, useState } from "react";

type Item = {
  id:number;
  content:string;
  jp?:string;
  book?:string;
};

export default function QuizPage(){

  const [items,setItems] = useState<Item[]>([]);
  const [filtered,setFiltered] = useState<Item[]>([]);
  const [current,setCurrent] = useState<Item | null>(null);
  const [choices,setChoices] = useState<string[]>([]);
  const [result,setResult] = useState<"correct" | "wrong" | null>(null);
  const [selected,setSelected] = useState<string | null>(null);

  const [score,setScore] = useState(0);
  const [total,setTotal] = useState(0);
  const [streak,setStreak] = useState(0);

  const [animate,setAnimate] = useState(false);
  const [selectedBook,setSelectedBook] = useState("All");

  const [translations,setTranslations] = useState<{[key:string]:string}>({});

  const MAX_QUESTIONS = 10;

  // -----------------------
  // データ取得
  // -----------------------
  useEffect(()=>{

    const load = async ()=>{

      const res = await fetch("/api/saved");
      const data = await res.json();

      if(Array.isArray(data)){
        setItems(data);
        setFiltered(data);
      }

    };

    load();

  },[]);

  // -----------------------
  // Bookフィルター（🔥フォールバック付き）
  // -----------------------
  useEffect(()=>{

    let list;

    if(selectedBook === "All"){
      list = items;
    }else{
      list = items.filter(i=>i.book === selectedBook);
    }

    // 🔥 少なすぎたらAllに戻す
    if(list.length < 2){
      setFiltered(items);
    }else{
      setFiltered(list);
    }

  },[selectedBook,items]);

  // -----------------------
  // 翻訳取得
  // -----------------------
  const getJP = async (item:Item) => {

    if(item.jp) return item.jp;

    if(translations[item.content]){
      return translations[item.content];
    }

    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${item.content}&langpair=en|ja`
    );

    const data = await res.json();
    const text = data.responseData.translatedText;

    setTranslations(prev=>({
      ...prev,
      [item.content]: text
    }));

    return text;
  };

  // -----------------------
  // 問題作成（🔥可変選択肢）
  // -----------------------
  const generateQuiz = async () => {

    if(filtered.length < 2) return;

    const shuffled = [...filtered].sort(()=>0.5 - Math.random());

    const correct = shuffled[0];

    const wrongCount = Math.min(3, filtered.length - 1);
    const wrongs = shuffled.slice(1, 1 + wrongCount);

    const correctJP = await getJP(correct);
    const wrongJP = await Promise.all(wrongs.map(getJP));

    const options = [correctJP, ...wrongJP]
      .sort(()=>0.5 - Math.random());

    setCurrent(correct);
    setChoices(options);
    setResult(null);
    setSelected(null);
    setAnimate(false);

  };

  useEffect(()=>{
    if(filtered.length > 0){
      generateQuiz();
    }
  },[filtered]);

  // -----------------------
  // 回答
  // -----------------------
  const answer = (choice:string) => {

    if(!current || result) return;

    setSelected(choice);
    setTotal(prev=>prev+1);

    const correctJP = current.jp || translations[current.content];

    if(choice === correctJP){

      setResult("correct");
      setScore(prev=>prev+1);
      setStreak(prev=>prev+1);

      setAnimate(true);
      setTimeout(()=>setAnimate(false),300);

      // 🔥 自動で次へ
      setTimeout(()=>{
        generateQuiz();
      },800);

    }else{

      setResult("wrong");
      setStreak(0);

    }

  };

  // -----------------------
  // リセット
  // -----------------------
  const resetQuiz = () => {
    setScore(0);
    setTotal(0);
    setStreak(0);
    generateQuiz();
  };

  // -----------------------
  // UI
  // -----------------------

  if(filtered.length < 2){
    return (
      <div className="p-10 text-center">
        <p>単語が足りません（2つ以上必要）😢</p>
      </div>
    );
  }

  if(!current){
    return <div className="p-10">Loading...</div>;
  }

  // 🔥 結果画面
  if(total >= MAX_QUESTIONS){
    return (
      <main className="max-w-md mx-auto p-6 text-center space-y-6 pb-20">

        <h1 className="text-2xl font-bold">🎉 Result</h1>

        <div className="text-3xl font-bold">
          {score} / {MAX_QUESTIONS}
        </div>

        <div className="text-gray-600">
          正答率: {Math.round((score / MAX_QUESTIONS)*100)}%
        </div>

        <button
          onClick={resetQuiz}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          もう一度
        </button>

      </main>
    );
  }

  return (

    <main className="max-w-md mx-auto p-6 text-center space-y-6 pb-20">

      <h1 className="text-2xl font-bold">🧠 Quiz</h1>

      {/* Book選択 */}
      <div className="flex justify-center gap-2 flex-wrap">

        {["All","Book1","Book2","Unsorted"].map((b)=>(
          <button
            key={b}
            onClick={()=>setSelectedBook(b)}
            className={`
              px-3 py-1 rounded-full border text-sm
              ${selectedBook === b
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
              }
            `}
          >
            {b}
          </button>
        ))}

      </div>

      {/* スコア */}
      <div className="text-gray-600">
        Score: {score} / {total}
      </div>

      {/* streak */}
      <div className="text-orange-500 font-semibold">
        🔥 Streak: {streak}
      </div>

      {/* 問題 */}
      <div
        className="text-3xl font-semibold transition-transform duration-300"
        style={{
          transform: animate ? "scale(1.15)" : "scale(1)"
        }}
      >
        {current.content}
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">

        {choices.map((c,i)=>{

          let bg = "bg-white";

          if(result){

            const correctJP = current.jp || translations[current.content];

            if(c === correctJP){
              bg = "bg-green-300";
            }else if(c === selected){
              bg = "bg-red-300";
            }

          }

          return(
            <button
              key={i}
              onClick={()=>answer(c)}
              className={`w-full border p-3 rounded ${bg}`}
            >
              {c}
            </button>
          );

        })}

      </div>

      {/* 結果表示 */}
      {result && (
        <div className="text-xl font-bold">

          {result === "correct" ? (
            <div className="text-green-600">
              ✅ Correct!
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Wrong
              <div className="mt-2 text-black">
                正解: {current.jp || translations[current.content]}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Next（間違えたとき） */}
      {result === "wrong" && (
        <button
          onClick={generateQuiz}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      )}

    </main>

  );

}