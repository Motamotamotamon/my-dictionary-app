import { normalizeExpression, phraseEntry } from "@/lib/phrases";
import { NextResponse } from "next/server";

const parts: Record<string, string> = {
  n: "noun", v: "verb", adj: "adjective", adv: "adverb",
  prep: "preposition", pron: "pronoun", interj: "interjection", conj: "conjunction",
};

export async function GET(req: Request) {
  const word = normalizeExpression(new URL(req.url).searchParams.get("word") || "");
  if (!word || word.length > 100) {
    return NextResponse.json({ error: "A word of 1–100 characters is required" }, { status: 400 });
  }
  const phrase = phraseEntry(word);
  if (phrase) return NextResponse.json([phrase]);
  try {
    const query = new URLSearchParams({ sp: word, qe: "sp", md: "dr", ipa: "1", max: "10" });
    const res = await fetch(`https://api.datamuse.com/words?${query}`, {
      signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!res.ok) {
      console.error("Dictionary provider failure", res.status);
      return NextResponse.json({ error: "Dictionary service unavailable" }, { status: 502 });
    }
    const results: unknown = await res.json();
    if (!Array.isArray(results)) {
      return NextResponse.json({ error: "Invalid dictionary response" }, { status: 502 });
    }
    // Never substitute a similarly spelled suggestion for the requested word.
    const match = results.find((item) => typeof item?.word === "string" && item.word.toLowerCase() === word.toLowerCase());
    const groups = new Map<string, { definition: string }[]>();
    for (const raw of Array.isArray(match?.defs) ? match.defs : []) {
      if (typeof raw !== "string") continue;
      const tab = raw.indexOf("\t");
      const definition = (tab >= 0 ? raw.slice(tab + 1) : raw).trim();
      if (!definition) continue;
      const part = tab >= 0 ? parts[raw.slice(0, tab)] || raw.slice(0, tab) : "other";
      const definitions = groups.get(part) || [];
      definitions.push({ definition });
      groups.set(part, definitions);
    }
    if (!groups.size) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    const pronunciation = Array.isArray(match.tags)
      ? match.tags.find((tag: unknown) => typeof tag === "string" && tag.startsWith("pron:"))?.slice(5) : undefined;
    return NextResponse.json([{
      word: match.word,
      phonetics: pronunciation ? [{ text: pronunciation }] : [],
      meanings: Array.from(groups, ([partOfSpeech, definitions]) => ({ partOfSpeech, definitions })),
      sourceUrls: ["https://www.datamuse.com/api/"],
      source: "Datamuse (Wiktionary / WordNet)",
    }]);
  } catch (error) {
    console.error("Dictionary request failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Failed to fetch dictionary" }, {
      status: error instanceof Error && error.name === "TimeoutError" ? 504 : 502,
    });
  }
}
