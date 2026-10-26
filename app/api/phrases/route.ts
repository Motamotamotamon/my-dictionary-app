import { NextResponse } from "next/server";
import { phraseSuggestions } from "@/lib/phrases";
export async function GET(req: Request) {
  return NextResponse.json(phraseSuggestions(new URL(req.url).searchParams.get("q") || ""), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } });
}
