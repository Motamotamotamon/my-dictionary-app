"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id:number
  content:string
  meanings?:any[]
  phonetic?:string
  book?:string
}

export default function VocabularyPage(){

  const [items,setItems] = useState<Item[]>([]);
  const [open,setOpen] = useState<{[key:string]:boolean}>({});
  const [translations,setTranslations] = useState<any>({});
  const [activeTab, setActiveTab] = useState("Book1");
  const router = useRouter();

  useEffect(()=>{

  const load = async ()=>{

    try{

      const res = await fetch("/api/saved");
      const data = await res.json();

      console.log("saved data", data); // 🔍 デバッグ

      // 🔥 ここが重要
      if(Array.isArray(data)){
        setItems(data);
      }else{
        setItems([]); // エラー回避
      }

    }catch(err){
      console.error(err);
      setItems([]);
    }

  };

  load();

},[]);



  const translate = async (text:string)=>{

    const res = await fetch("/api/translate",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({text})
    });

    const data = await res.json();

    return data.jp;

  };



  const toggle = async (word:string)=>{

    const isOpen = !open[word];

    setOpen({
      ...open,
      [word]:isOpen
    });

    if(!isOpen) return;

    const item = items.find(i=>i.content===word);

    if(!item?.meanings) return;

    const newTranslations:any = {...translations};

    for(let i=0;i<item.meanings.length;i++){

      const defs = item.meanings[i].definitions.slice(0,2);

      for(let j=0;j<defs.length;j++){

        const key = `${word}-${i}-${j}`;

        if(!newTranslations[key]){

          const jp = await translate(defs[j].definition);

          newTranslations[key] = jp;

        }

      }

    }

    setTranslations(newTranslations);

  };


  const speak = (word:string)=>{

    const uttr = new SpeechSynthesisUtterance(word);
    uttr.lang = "en-US";
    speechSynthesis.speak(uttr);

  };


  const goDetail = (word:string)=>{
  router.push(`/search/${word}`);
};


  const removeWord = async (word:string) => {

  await fetch(`/api/saved?content=${word}`,{
    method:"DELETE"
  });

  const res = await fetch("/api/saved");
  const data = await res.json();

  if(Array.isArray(data)){
    setItems(data);
  }
};

  const updateBook = async (word:string,book:string)=>{

    await fetch("/api/saved",{
      method:"PATCH",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        content:word,
        book:book
      })
    });

    setItems(currentItems.map(i =>
      i.content===word ? {...i,book} : i
    ));

  };


  const book1 = items.filter(i => i.book === "Book1");
  const book2 = items.filter(i => i.book === "Book2");
  const others = items.filter(i => !i.book || i.book === "Unsorted");

  let currentItems: Item[] = [];

if (activeTab === "Book1") currentItems = book1;
if (activeTab === "Book2") currentItems = book2;
if (activeTab === "Unsorted") currentItems = others;



  const Card = ({item}:{item:Item}) => (

    <div className="border rounded p-4 mb-3 bg-white shadow-sm">

      <div className="flex justify-between items-center">

        {/* 単語クリックで詳細 */}
        <button
          onClick={()=>goDetail(item.content)}
          className="text-xl font-bold text-left hover:underline"
        >
          📖 {item.content}
        </button>

        <div className="flex items-center gap-2">

          {open[item.content] && (
            <button
              onClick={()=>speak(item.content)}
              className="text-lg"
            >
              🔊
            </button>
          )}

          {/* 開閉ボタン */}
          <button
            onClick={()=>toggle(item.content)}
            className="text-lg"
          >
            {open[item.content] ? "▲" : "▼"}
          </button>

        </div>

      </div>


      {open[item.content] && (

        <div className="mt-3">

          {item.phonetic && (
            <p className="text-gray-500">
              {item.phonetic}
            </p>
          )}

          {item.meanings?.map((m:any,i:number)=>{

            const posJP = {
              noun:"名詞",
              verb:"動詞",
              adjective:"形容詞",
              adverb:"副詞"
            }[m.partOfSpeech] || m.partOfSpeech;

            return(

              <div key={i} className="mt-3">

                <p className="font-semibold">
                  {posJP}
                </p>

                <ul className="list-disc ml-5">

                  {m.definitions.slice(0,2).map((d:any,j:number)=>{

                    const key = `${item.content}-${i}-${j}`;

                    return(

                      <li key={j}>

                        {d.definition}

                        <div className="text-gray-600 text-sm">
                          {translations[key]}
                        </div>

                      </li>

                    );

                  })}

                </ul>

              </div>

            );

          })}

        </div>

      )}


      <div className="flex gap-3 mt-4">

        <button
          onClick={()=>removeWord(item.content)}
          className="text-red-600 font-semibold hover:underline"
        >
          🗑 Remove
        </button>

        <button
          onClick={()=>updateBook(item.content,"Book1")}
          className="bg-blue-100 px-2 py-1 rounded text-sm"
        >
          📘 Book1
        </button>

        <button
          onClick={()=>updateBook(item.content,"Book2")}
          className="bg-green-100 px-2 py-1 rounded text-sm"
        >
          📗 Book2
        </button>

      </div>

    </div>

  );


  return(

    <main className="max-w-xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        📚 Vocabulary
      </h1>

      {/* 🔥 タブUI */}
<div className="flex gap-2 mb-6 justify-center">

  <button
    onClick={() => setActiveTab("Book1")}
    className={`px-4 py-2 rounded-lg border transition ${
      activeTab === "Book1"
        ? "bg-blue-500 text-white"
        : "bg-white"
    }`}
  >
    📘 Book1 ({book1.length})
  </button>

  <button
    onClick={() => setActiveTab("Book2")}
    className={`px-4 py-2 rounded-lg border transition ${
      activeTab === "Book2"
        ? "bg-green-500 text-white"
        : "bg-white"
    }`}
  >
    📗 Book2 ({book2.length})
  </button>

  <button
    onClick={() => setActiveTab("Unsorted")}
    className={`px-4 py-2 rounded-lg border transition ${
      activeTab === "Unsorted"
        ? "bg-gray-500 text-white"
        : "bg-white"
    }`}
  >
    📂 Others ({others.length})
  </button>

</div>

{/* 🔥 表示部分 */}
{currentItems.length === 0 && (
  <p className="text-gray-400">No words yet</p>
)}

{currentItems.map(item => (
  <Card key={item.id} item={item}/>
))}

    </main>

  );

}