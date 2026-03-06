"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query) return;

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${query}`
    );

    const data = await res.json();

    setResults(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dictionary Search</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search word..."
      />

      <button onClick={handleSearch}>Search</button>

      <div style={{ marginTop: 20 }}>
        {results.map((entry, i) => (
          <div key={i}>
            <h2>{entry.word}</h2>

            {entry.meanings.map((m: any, j: number) => (
              <div key={j}>
                <strong>{m.partOfSpeech}</strong>

                {m.definitions.map((d: any, k: number) => (
                  <p key={k}>• {d.definition}</p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}