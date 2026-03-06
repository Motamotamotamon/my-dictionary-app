"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [searchWord, setSearchWord] = useState("");
  const [selectedMode, setSelectedMode] = useState("en-ja");
  const [history, setHistory] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  // 📖 辞書取得
const fetchDictionary = async (word: string) => {
  const res = await fetch(`/api/dictionary?word=${word}`);
  const data = await res.json();
  setDictionaryData(data);
};

// 🤖 AI取得（これ1つだけ残す）
const fetchAI = async (word: string, id: number) => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, id }),
  });

  const data = await res.json();
  console.log("AI response:", data);
  setAiResult(data);
};


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
  // 🕘 履歴取得
const fetchRecentHistory = async () => {
  const res = await fetch("/api/history");
  const data = await res.json();
  setHistory(data);
};
const fetchSaved = async () => {
  const res = await fetch("/api/saved");  // ← 修正
  const data = await res.json();

  const ids = data.map((item: any) => item.wordId);

  setSavedIds(ids);
};

// 🔎 検索実行（履歴保存付き）
const handleSearch = async () => {
  if (!query.trim()) return;

  // 履歴保存
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      mode: selectedMode,
    }),
  });

  fetchRecentHistory();
};
useEffect(() => {
  fetchRecentHistory();
  fetchSaved();
}, []);


  return (
    <main style={{ padding: 20 }}>
      <h1>📘 自分の単語帳</h1>
      <div style={{ marginBottom: 20 }}>
  <Link
    href="/saved"
    style={{
      padding: "6px 12px",
      backgroundColor: "#facc15",
      borderRadius: 6,
      textDecoration: "none",
      color: "black",
      fontWeight: "bold",
    }}
  >
    ⭐ 保存一覧
  </Link>
</div>

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
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }}
  style={{ padding: 8, width: 300, marginBottom: 20 }}
/>
<div style={{ marginTop: 20, marginBottom: 20 }}>
  <h3>🕘 Recent Searches</h3>
  {history.map((item) => (
    <div key={item.id}>
      {item.query} ({item.mode})
    </div>
  ))}
</div>

<button
  type="button"
  onClick={handleSearch}
  style={{ marginLeft: 10 }}
>
  検索
</button>

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
      <td>
  {w.word}

  {console.log("w.id:", w.id, "type:", typeof w.id)}

  <button
    type="button"
    style={{ marginLeft: 6 }}
    onClick={() => fetchDictionary(w.word)}
  >
    📖
  </button>

  <button
    type="button"
    style={{ marginLeft: 6 }}
    onClick={() => fetchAI(w.word, w.id)}
  >
    🤖
  </button>

  <span
  onClick={async () => {
    const isSaved = savedIds.includes(w.id);

    if (isSaved) {
      await fetch(`/api/saved?wordId=${w.id}`, {  // ← 修正
  method: "DELETE",
});

      // 🔥 stateから削除
      setSavedIds((prev) => prev.filter((id) => id !== w.id));
    } else {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordId: w.id,
          content: w.word,
        }),
      });

      // 🔥 stateに追加
      setSavedIds((prev) => [...prev, w.id]);
    }
  }}
  style={{
    marginLeft: 6,
    cursor: "pointer",
    fontSize: 20,
    color: savedIds.includes(w.id) ? "#facc15" : "#bbb",
    transition: "0.2s",
  }}
>
  {savedIds.includes(w.id) ? "★" : "☆"}
</span>


</td>
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
      {dictionaryData && (
  <div
    style={{
      marginTop: 30,
      padding: 20,
      border: "1px solid gray",
      borderRadius: 8,
    }}
  >
    <h2>📖 英英辞書</h2>

    {dictionaryData[0]?.meanings?.map((meaning: any, i: number) => (
      <div key={i} style={{ marginBottom: 20 }}>
        <h3>{meaning.partOfSpeech}</h3>

        {meaning.definitions.map((def: any, j: number) => (
          <div key={j} style={{ marginBottom: 10 }}>
            <p>• {def.definition}</p>

            {def.example && (
              <p style={{ color: "gray", marginLeft: 10 }}>
                Example: {def.example}
              </p>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
)}

{aiResult && (
  <div style={{ marginTop: 40 }}>

    {/* 🔵 Idioms */}
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, marginBottom: 20 }}>
      <h2>🔵 Idioms / Phrases</h2>
      {aiResult.idioms?.map((item: any, i: number) => (
        <div key={i} style={{ marginBottom: 15 }}>
          <strong>{item.expression}</strong>
          <p>{item.meaning}</p>
          <p style={{ color: "gray" }}>{item.example}</p>
        </div>
      ))}
    </div>

    {/* 🟢 Usage */}
    <div style={{ padding: 20, border: "1px solid #4CAF50", borderRadius: 8, marginBottom: 20 }}>
      <h2>🟢 Usage</h2>
      <p><strong>Frequency:</strong> {aiResult.usage?.frequency}</p>
      <p><strong>Formality:</strong> {aiResult.usage?.formality}</p>
      <p>{aiResult.usage?.notes}</p>
    </div>

    {/* 🟡 Translation */}
    <div style={{ padding: 20, border: "1px solid #FFC107", borderRadius: 8, marginBottom: 20 }}>
      <h2>🟡 Japanese Translation</h2>
      <p><strong>Literal:</strong> {aiResult.translation?.literal_japanese}</p>
      <p><strong>Medical:</strong> {aiResult.translation?.medical_context}</p>
      <p><strong>Casual:</strong> {aiResult.translation?.casual_context}</p>
    </div>

    {/* 🔴 Native Warning */}
    <div style={{ padding: 20, border: "1px solid red", borderRadius: 8 }}>
      <h2>🔴 Native Naturalness</h2>
      <p>
        {aiResult.native_warning?.is_natural ? "✅ Natural expression" : "⚠️ Not natural"}
      </p>
      <p>{aiResult.native_warning?.explanation}</p>
    </div>

  </div>
)}
    </main>
  );
}