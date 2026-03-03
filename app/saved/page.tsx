"use client";

import { useEffect, useState } from "react";

export default function SavedPage() {
  const [items, setItems] = useState<any[]>([]);

  const toggleSave = async (wordId: number) => {
    await fetch(`/api/saved?wordId=${wordId}`, {
      method: "DELETE",
    });

    // UI即反映
    setItems((prev) =>
      prev.filter((item) => item.wordId !== wordId)
    );
  };

  useEffect(() => {
    fetch("/api/saved")
      .then((res) => res.json())
      .then((data) => {
        console.log("SAVED DATA:", data);
        setItems(data);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>保存済み単語</h1>

      {items.length === 0 && <p>まだ保存がありません</p>}

      {items.map((item: any) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span>{item.word.word}</span>

          <span
            onClick={() => toggleSave(item.wordId)}
            style={{
              cursor: "pointer",
              fontSize: 20,
              color: "#facc15",
            }}
          >
            ★
          </span>
        </div>
      ))}
    </div>
  );
}