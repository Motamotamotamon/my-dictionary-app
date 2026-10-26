"use client";

import { useState } from "react";
import { notesOf, type SavedWord } from "@/lib/vocabulary";
import SpeechControls from "@/components/SpeechControls";

type Item = SavedWord;

type Props = {
  item: Item;
  onUpdate: (item: SavedWord)=>void;
  goDetail: (word:string)=>void;
  removeWord: (word:string)=>void;
  updateBook: (word:string,book:string)=>void;
  translations: {[key:string]: string};
};

export default function VocabularyCard({
  item,
  onUpdate,
  goDetail,
  removeWord,
  updateBook,
  translations
}: Props){

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ jp: item.jp || "", ...notesOf(item) });
  const notes = notesOf(item);
  const save = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/saved", { method: "PATCH", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000), body: JSON.stringify({ id: item.id, ...draft }) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      if (updated.id !== item.id) throw new Error();
      onUpdate(updated); setEditing(false);
    } catch { setError("保存できませんでした。編集内容は残っています。再試行してください。"); }
    finally { setBusy(false); }
  };
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

      {notes.note && <p className="mt-3 whitespace-pre-wrap text-gray-700">📝 {notes.note}</p>}
      {notes.example && <div className="mt-3"><p className="italic whitespace-pre-wrap">{notes.example}</p><p>{notes.exampleJP}</p><SpeechControls text={notes.example} label="自分の例文" /></div>}
      {editing && <div className="mt-4 space-y-3 border rounded p-3">
        {([ ["jp", "覚えたい意味"], ["note", "自分のメモ"], ["example", "自分の英語例文"], ["exampleJP", "例文の日本語訳"] ] as const).map(([key, label]) =>
          <label key={key} className="block">{label}<textarea className="block border rounded p-2 w-full" value={draft[key]} disabled={busy}
            maxLength={key === "jp" ? 1000 : 3000} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} /></label>)}
        <p className="text-sm text-gray-500">辞書のほかの意味・例文はそのまま残ります。</p>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={busy} onClick={save} className="bg-blue-500 text-white px-3 py-2 rounded">{busy ? "保存中…" : "変更を保存"}</button>
        <button disabled={busy} onClick={() => setEditing(false)} className="ml-3">キャンセル</button>
      </div>}
      <div className="flex flex-wrap gap-3 mt-4">
        <button onClick={() => { setDraft({ jp: item.jp || "", ...notesOf(item) }); setError(""); setEditing(true); }} className="border rounded px-3 py-1">✏️ 編集</button>

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