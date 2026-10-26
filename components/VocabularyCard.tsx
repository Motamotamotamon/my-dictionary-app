"use client";

import SpeechControls from "@/components/SpeechControls";

type Item = {
  id:number
  content:string
  jp?:string
  meanings?:any[]
  phonetic?:string
  book?:string
};

type Props = {
  item: Item;
  open: {[key:string]:boolean};
  toggle: (word:string)=>void;
  speak: (word:string)=>void;
  goDetail: (word:string)=>void;
  removeWord: (word:string)=>void;
  updateBook: (word:string,book:string)=>void;
  translations: {[key:string]: string};
};

export default function VocabularyCard({
  item,
  open,
  toggle,
  speak,
  goDetail,
  removeWord,
  updateBook,
  translations
}: Props){

  return(

    <div className="border rounded p-4 mb-3 bg-white shadow-sm">

      <div className="flex justify-between items-center">

        <button
          onClick={()=>goDetail(item.content)}
          className="text-xl font-bold text-left hover:underline"
        >
          📖 {item.content}
        </button>

        <div className="flex items-center gap-2">

          <SpeechControls text={item.content} label={item.content} />

        </div>

      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-500">覚えたい意味</p>
        <p className="font-semibold text-blue-700">{item.jp || item.meanings?.flatMap((m: any) => m.definitions).find((d: any) => d.selected)?.definition || "意味未登録"}</p>
        {item.meanings?.flatMap((m: any) => m.definitions).filter((d: any) => d.selected).map((d: any, i: number) =>
          <div key={i}><p>{d.definition}</p>{d.example && <span className="block"><span className="block italic">{d.example}</span><SpeechControls text={d.example} label="保存した例文" /></span>}{d.exampleJP && <p>{d.exampleJP}</p>}</div>
        )}
        <details className="border rounded p-3">
          <summary className="cursor-pointer font-medium">ほかの意味・すべての例文を見る</summary>
          {item.phonetic && <p className="text-gray-500">{item.phonetic}</p>}
          {item.meanings?.map((m: any, i: number) => <div key={i} className="mt-3">
            <p className="font-semibold">{m.partOfSpeech}</p>
            <ul className="list-disc ml-5 space-y-3">{m.definitions.map((d: any, j: number) => <li key={j}>
              {d.selected && <span className="text-blue-600">★ 覚えたい意味 </span>}{d.definition}
              <p className="text-blue-600">{d.jp || translations[`${item.content}-${i}-${j}`]}</p>
              {d.example && <span className="block"><span className="block italic">{d.example}</span><SpeechControls text={d.example} label="保存した例文" /></span>}
              {d.exampleJP && <p>{d.exampleJP}</p>}
            </li>)}</ul>
          </div>)}
          {!item.meanings?.length && <p className="mt-2">保存された定義はありません。単語名から辞書を開けます。</p>}
        </details>
      </div>

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
}