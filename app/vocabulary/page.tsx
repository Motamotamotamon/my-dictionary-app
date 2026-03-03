"use client";

import { useEffect, useState } from "react";

type SavedItem = {
  id: number;
  content: string;
  createdAt: string;
  word?: {
    meaning: string;
    partOfSpeech: string;
  };
};

export default function VocabularyPage() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    fetch("/api/save")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>📚 保存した単語一覧</h1>

      {items.length === 0 && <p>まだ保存された単語はありません。</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 15,
            borderRadius: 8,
          }}
        >
          <h2>{item.content}</h2>
          <p><strong>意味:</strong> {item.word?.meaning}</p>
          <p><strong>品詞:</strong> {item.word?.partOfSpeech}</p>
          <p style={{ fontSize: 12, color: "gray" }}>
            保存日: {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </main>
  );
}
