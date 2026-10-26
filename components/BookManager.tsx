"use client";
import { useState } from "react";
import { type Book } from "@/lib/books";
export default function BookManager({ books, onSave }: { books: Book[]; onSave: (book: Book) => void }) {
  const [editing, setEditing] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/books", { method: editing === "new" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000), body: JSON.stringify({ id: editing, name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存できませんでした。");
      onSave(data); setEditing(""); setName("");
    } catch (e) { setError(e instanceof Error ? e.message : "保存できませんでした。"); }
    finally { setBusy(false); }
  };
  return <details className="border rounded p-3 my-4"><summary className="cursor-pointer font-semibold">📚 Bookを追加・名前変更</summary>
    <button className="border rounded px-3 py-2 my-3" disabled={busy} onClick={() => { setEditing("new"); setName(""); setError(""); }}>＋ Bookを追加</button>
    <ul>{books.map(book => <li key={book.id} className="flex justify-between items-center gap-2 py-2"><span>{book.name}</span><button disabled={busy} className="text-blue-600" onClick={() => { setEditing(book.id); setName(book.name); setError(""); }}>名前を変更</button></li>)}</ul>
    {editing && <div className="space-y-2 mt-3"><label className="block">{editing === "new" ? "新しいBook名" : "変更後のBook名"}<input value={name} onChange={e => setName(e.target.value)} maxLength={60} disabled={busy} className="block border rounded p-2 w-full" /></label>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button disabled={busy || !name.trim()} onClick={save} className="bg-blue-500 text-white rounded px-3 py-2">{busy ? "保存中…" : "保存"}</button>
      <button disabled={busy} onClick={() => setEditing("")} className="ml-3">キャンセル</button>
    </div>}
  </details>;
}
