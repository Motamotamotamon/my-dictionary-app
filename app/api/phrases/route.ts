import { NextResponse } from "next/server";
import { phraseSuggestions } from "@/lib/phrases";
export async function GET(req: Request) {
  return NextResponse.json(phraseSuggestions(new URL(req.url).searchParams.get("q") || ""));
}
