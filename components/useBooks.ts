"use client";
import { useEffect, useState } from "react";
import { defaultBooks, type Book } from "@/lib/books";
export function useBooks() {
  const [books, setBooks] = useState<Book[]>(defaultBooks);
  const [bookError, setBookError] = useState("");
  const [booksLoading, setBooksLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/books", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error();
        if (active) { setBooks(data); setBookError(""); }
      } catch { if (active) setBookError("Book一覧を取得できませんでした。再読み込みしてください。"); }
      finally { if (active) setBooksLoading(false); }
    };
    void load(); window.addEventListener("focus", load);
    return () => { active = false; window.removeEventListener("focus", load); };
  }, []);
  return { books, setBooks, bookError, booksLoading };
}
