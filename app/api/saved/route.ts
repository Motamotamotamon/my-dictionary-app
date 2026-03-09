import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const saved = await prisma.savedItem.create({
      data: {
        type: "word",
        content,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
export async function GET() {
  try {
    const items = await prisma.savedItem.findMany({
      where: { type: "word" },
      orderBy: { createdAt: "desc" },
      include: { word: true },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET SAVE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved items" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wordId = Number(searchParams.get("wordId"));

    console.log("DELETE wordId:", wordId);

    await prisma.savedItem.deleteMany({
      where: {
        wordId: wordId,
        type: "word",
      },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}



