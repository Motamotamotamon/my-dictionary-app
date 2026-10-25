import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word")?.trim();

  if (!word) {
    return NextResponse.json({ error: "Word is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: res.status === 404 ? "Word not found" : "Dictionary service unavailable" },
        { status: res.status === 404 ? 404 : 502 }
      );
    }

    const data = await res.json();
    if (!Array.isArray(data) || !data.length || !Array.isArray(data[0]?.meanings)) {
      return NextResponse.json({ error: "Invalid dictionary response" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch dictionary" },
      { status: error instanceof Error && error.name === "TimeoutError" ? 504 : 502 }
    );
  }
}
