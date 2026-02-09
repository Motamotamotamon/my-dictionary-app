"use client";

import { useEffect, useState } from "react";

type Word = {
  id: number;
  word: string;
  meaning: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
};

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newPos, setNewPos] = useState("");
  const [newDef, setNewDef] = useState("");
  const [newExample, setNewExample] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editExample, setEditExample] = useState("");

  const saveEdit = async (w: Word) => {
  await fetch("/api/word", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: w.id,
      meaning: editMeaning,
      example: editExample,
    }),
  });

  // 🔥 query を保ったまま再取得
  const res = await fetch(
    `/api/word?query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  setWords(data);

  setEditingId(null);
};

  

  useEffect(() => {
    fetch(`/api/word?query=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then(setWords);
  }, [query]);

  return (
    <main style={{ padding: 20 }}>
      <h1>📘 自分の単語帳</h1>
      <h2>➕ 新しい単語を追加</h2>

<div style={{ marginBottom: 20 }}>
  <input
    placeholder="単語"
    value={newWord}
    onChange={(e) => setNewWord(e.target.value)}
  />
  <input
    placeholder="意味"
    value={newMeaning}
    onChange={(e) => setNewMeaning(e.target.value)}
  />
  <input
    placeholder="品詞"
    value={newPos}
    onChange={(e) => setNewPos(e.target.value)}
  />
  <input
    placeholder="定義"
    value={newDef}
    onChange={(e) => setNewDef(e.target.value)}
  />
  <input
    placeholder="例文"
    value={newExample}
    onChange={(e) => setNewExample(e.target.value)}
  />

  <button
    type="button"
    onClick={async () => {
      await fetch("/api/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: newWord,
          meaning: newMeaning,
          partOfSpeech: newPos,
          definition: newDef,
          example: newExample,
        }),
      });

      // 再取得
      const res = await fetch(`/api/word?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setWords(data);

      // 初期化
      setNewWord("");
      setNewMeaning("");
      setNewPos("");
      setNewDef("");
      setNewExample("");
    }}
  >
    追加
  </button>
</div>

      <input
        placeholder="🔍 単語・意味で検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: 300, marginBottom: 20 }}
      />

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>単語</th>
            <th>意味</th>
            <th>品詞</th>
            <th>定義</th>
            <th>例文</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
  {words.map((w) => (
    <tr key={w.id}>
      <td>{w.word}</td>
      <td>
  {editingId === w.id ? (
    <input
  value={editMeaning}
  onChange={(e) => setEditMeaning(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(w);
    }
  }}
  style={{ width: 120 }}
/>
  ) : (
    w.meaning
  )}
</td>

      <td>{w.partOfSpeech}</td>
      <td>{w.definition}</td>
      <td>
  {editingId === w.id ? (
    <textarea
  value={editExample}
  onChange={(e) => setEditExample(e.target.value)}
  rows={2}
  style={{ width: 200 }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit(w);
    }
  }}
/>
  ) : (
    w.example
  )}
</td>
      <td>
  {editingId === w.id ? (
    <>
      <button type="button" onClick={() => saveEdit(w)}>
  保存
</button>

      <button
  type="button"
  style={{ marginLeft: 8 }}
  onClick={() => {
    setEditingId(null);
    setEditMeaning("");
    setEditExample("");
  }}
>
  キャンセル
</button>
    </>
  ) : (
    <button
  type="button"
  onClick={() => {
    setEditingId(w.id);              // ← これが最重要
    setEditMeaning(w.meaning);       // 現在値をセット
    setEditExample(w.example ?? "");
  }}
>
  編集
</button>
  )}
  {editingId !== w.id && (
  <button
  type="button"
  style={{ marginLeft: 8, color: "red" }}
  onClick={async () => {
    if (!confirm("この単語を削除しますか？")) return;

    await fetch("/api/word", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: w.id }),
    });

    // 🔁 削除後に一覧を再取得
    const res = await fetch(`/api/word?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setWords(data);
  }}
>
  削除
</button>
)}
</td>
    </tr>
  ))}
</tbody>
      </table>
    </main>
  );
}