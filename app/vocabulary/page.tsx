"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooks } from "@/components/useBooks";
import BookManager from "@/components/BookManager";
import VocabularyCard from "@/components/VocabularyCard";
import { matchesWord, type SavedWord } from "@/lib/vocabulary";

export default function VocabularyPage() {
  const { books, setBooks, bookError } = useBooks();
  const [items, setItems] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [activeTab, setActiveTab] = useState("Book1");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const router = useRouter();
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      try {
        const res = await fetch("/api/saved", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error();
        if (active) setItems(data);
      } catch { if (active) setError("単語帳を読み込めませんでした。再読み込みしてください。"); }
      finally { if (active) setLoading(false); }
    };
    void load();
    window.addEventListener("focus", load);
    return () => { active = false; window.removeEventListener("focus", load); };
  }, [reload]);
  const mutate = async (word: string, book?: string) => {
    setError("");
    try {
      const res = await fetch(book ? "/api/saved" : `/api/saved?content=${encodeURIComponent(word)}`, {
        method: book ? "PATCH" : "DELETE", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000), ...(book ? { body: JSON.stringify({ content: word, book }) } : {}),
      });
      if (!res.ok) throw new Error();
      setItems(previous => book ? previous.map(item => item.content === word ? { ...item, book } : item) : previous.filter(item => item.content !== word));
      if (book) setActiveTab(book);
    } catch { setError("変更を保存できませんでした。もう一度お試しください。"); }
  };
  const inBook = (item: SavedWord, book: string) => book === "All" || (book === "Unsorted" ? !item.book || item.book === book : item.book === book);
  const bookItems = items.filter(item => inBook(item, activeTab));
  const visible = bookItems.filter(item => matchesWord(item, query));
  if (sort === "alphabet") visible.sort((a, b) => a.content.localeCompare(b.content, "en", { sensitivity: "base" }));
  return <main className="max-w-xl mx-auto p-6 pb-20">
    <h1 className="text-3xl font-bold mb-6">📚 Vocabulary</h1>
    <BookManager books={books} onSave={updated => { setBooks(previous => previous.some(book => book.id === updated.id) ? previous.map(book => book.id === updated.id ? updated : book) : [...previous, updated]); setActiveTab(updated.id); }} />
    {bookError && <p role="alert" className="text-red-600">{bookError}</p>}
    <label className="block">単語帳を検索
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="英語・日本語・例文・メモ" className="border rounded p-3 w-full mt-2" />
    </label>
    <div className="flex flex-wrap gap-2 my-4">
      {[["All", "すべて"], ...books.map(book => [book.id, book.name])].map(([book, label]) =>
        <button key={book} onClick={() => setActiveTab(book)} aria-pressed={activeTab === book} className={`border rounded px-3 py-2 ${activeTab === book ? "bg-blue-500 text-white" : ""}`}>
          {label} ({loading || error ? "—" : items.filter(item => inBook(item, book)).length})
        </button>)}
    </div>
    <label>並び順 <select value={sort} onChange={event => setSort(event.target.value)} className="border rounded p-2 mb-4">
      <option value="recent">新しく保存した順</option><option value="alphabet">アルファベット順</option>
    </select></label>
    {loading && <p role="status">読み込み中…</p>}
    {error && <div role="alert" className="text-red-600"><p>{error}</p><button onClick={() => setReload(value => value + 1)}>再読み込み</button></div>}
    {!loading && !error && <p className="text-sm text-gray-500 mb-3" role="status">{visible.length} / {bookItems.length}件</p>}
    {!loading && !error && !visible.length && <p className="text-center my-6">{query.trim() ? "一致する表現がありません。「すべて」タブでも検索できます。" : "まだ保存された表現がありません。"}</p>}
    {visible.map(item => <VocabularyCard key={item.id} item={item} books={books} translations={{}}
      goDetail={word => router.push(`/search/${encodeURIComponent(word)}`)}
      removeWord={word => { void mutate(word); }} updateBook={(word, book) => { void mutate(word, book); }}
      onUpdate={updated => setItems(previous => previous.map(item => item.id === updated.id ? updated : item))} />)}
  </main>;
}
