"use client";

import { useBooks } from "@/components/useBooks";
import { useEffect, useState } from "react";

type Props = { word: string; jpWord: string; phonetic?: string; meanings: any[] };

export default function SaveButton({ word, jpWord, phonetic, meanings }: Props) {
  const { books, bookError, booksLoading } = useBooks();
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [book, setBook] = useState("Book1");
  const [selected, setSelected] = useState("all");
  const [focusJP, setFocusJP] = useState("");
  const options = meanings.flatMap((meaning, i) => meaning.definitions.map((definition: any, j: number) => ({
    ...definition, key: `${i}-${j}`, partOfSpeech: meaning.partOfSpeech,
  })));
  const chosen = options.find(option => option.key === selected);

  useEffect(() => {
    let active = true;
    setChecking(true);
    setSaved(false);
    setEditing(false);
    setSelected("all");
    setFocusJP("");
    setError("");
    (async () => {
      try {
        const res = await fetch(`/api/saved?content=${encodeURIComponent(word)}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error();
        const items = await res.json();
        if (!Array.isArray(items)) throw new Error();
        const item = items.find(item => item.content === word);
        if (!active || !item) return;
        setSaved(true);
        setBook(item.book || "Unsorted");
        const focus = item.meanings?.flatMap((m: any) => m.definitions || []).find((d: any) => d.selected === true);
        if (focus) {
          // Definition text is stable across ordering changes in a later lookup.
          setSelected(`definition:${focus.definition}`);
          setFocusJP(item.jp || focus.jp || "");
        }
      } catch {
        if (active) setError("保存状態を確認できませんでした。再読み込みしてください。");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [word]);

  const selectedDefinition = chosen || (selected.startsWith("definition:")
    ? options.find(option => option.definition === selected.slice(11)) : undefined);
  const meaningJP = selected === "all" ? jpWord : focusJP || selectedDefinition?.jp || selectedDefinition?.definition || "";

  const save = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/saved", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ content: word, jp: meaningJP, phonetic, book,
          meanings: meanings.map(m => ({ ...m, definitions: m.definitions.map((d: any) => ({
            ...d, selected: selectedDefinition ? d.definition === selectedDefinition.definition : false,
          })) })),
        }),
      });
      if (!res.ok) throw new Error();
      const item = await res.json();
      if (!item?.id || item.content !== word || item.book !== book) throw new Error();
      setSaved(true); setEditing(false);
    } catch { setError("保存できませんでした。もう一度お試しください。"); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/saved?content=${encodeURIComponent(word)}`, { method: "DELETE", signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error();
      setSaved(false); setEditing(false);
    } catch { setError("保存の解除に失敗しました。"); }
    finally { setBusy(false); }
  };

  return <section className="space-y-3 border rounded-xl p-4">
    <button disabled={busy || checking} onClick={() => setEditing(value => !value)} className="border rounded-lg px-4 py-2">
      {checking ? "保存状態を確認中…" : saved ? "★ Saved・保存内容を変更" : "☆ Save・意味を選んで保存"}
    </button>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {editing && <div className="space-y-3">
      <fieldset disabled={busy} className="space-y-2">
        <legend className="font-semibold">覚えたい意味</legend>
        <label className="block"><input type="radio" name={`sense-${word}`} checked={selected === "all"}
          onChange={() => { setSelected("all"); setFocusJP(""); }} /> 意味を絞らず保存</label>
        {options.map(option => <label key={option.key} className="block border rounded p-3">
          <input type="radio" name={`sense-${word}`} checked={selectedDefinition?.key === option.key}
            onChange={() => { setSelected(option.key); setFocusJP(option.jp || ""); }} /> {option.definition}
          {option.jp && <span className="block text-blue-600">{option.jp}</span>}
        </label>)}
      </fieldset>
      {selected !== "all" && <label className="block">覚えたい意味のメモ（日本語など）
        <input value={focusJP} onChange={event => setFocusJP(event.target.value)} disabled={busy} maxLength={500}
          placeholder={selectedDefinition?.jp || "自分が覚えたい意味を入力"} className="block border rounded p-2 w-full" />
        <span className="text-sm text-gray-600">未入力の場合は選んだ意味を保存します。</span>
      </label>}
      <label className="block">保存先 <select value={book} disabled={busy || booksLoading || !!bookError} onChange={event => setBook(event.target.value)} className="border rounded p-2">
        {books.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      {bookError && <p role="alert" className="text-red-600">{bookError}</p>}
      <p className="text-sm text-gray-600">ほかの意味と例文も一緒に保存され、単語帳から開けます。</p>
      <button disabled={busy || booksLoading || !!bookError} onClick={save} className="bg-blue-500 text-white rounded px-4 py-2">{busy ? "処理中…" : "この内容で保存"}</button>
      {saved && <button disabled={busy} onClick={remove} className="ml-3 text-red-600">保存を解除</button>}
    </div>}
  </section>;
}
