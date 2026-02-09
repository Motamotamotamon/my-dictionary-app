import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";

  const words = await prisma.word.findMany({
    where: {
      OR: [
        {
          word: {
            contains: query,
            mode: "insensitive", // ← 大文字小文字無視
          },
        },
        {
          meaning: {
            contains: query,
          },
        },
        {
          definition: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(words);
}

/* POST */
export async function POST(req: Request) {
  const body = await req.json();
  const { word, meaning, definition, example, partOfSpeech } = body;

  const saved = await prisma.word.create({
    data: { word, meaning, definition, example, partOfSpeech },
  });

  return NextResponse.json(saved);
}

/* PATCH */
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, meaning } = body;

  const updated = await prisma.word.update({
    where: { id },
    data: { meaning,example, },
  });

  return NextResponse.json(updated);
}
/* DELETE */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    await prisma.word.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE ERROR:", e);
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}
