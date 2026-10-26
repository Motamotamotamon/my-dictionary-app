import { bookExists } from "@/lib/book-store";
import { NextResponse } from "next/server";
import { notesOf, withNotes } from "@/lib/vocabulary";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      content,
      jp,
      phonetic,
      meanings,
      book
    } = await req.json();

    if (!(await bookExists(book || "Unsorted"))) return NextResponse.json({ error: "Book not found" }, { status: 400 });

    // 🔥 既にあるかチェック
    const existing = await prisma.savedItem.findFirst({
      where: {
        content,
        type: "word"
      }
    });

    let saved;

    if (existing) {
      // 🔥 あれば更新（重複防止）
      saved = await prisma.savedItem.update({
        where: { id: existing.id },
        data: {
          jp,
          phonetic,
          meanings: withNotes(meanings, notesOf(existing as any).note, notesOf(existing as any).example, notesOf(existing as any).exampleJP),
          book: book || "Unsorted"
        }
      });
    } else {
      // 🔥 なければ新規作成
      saved = await prisma.savedItem.create({
        data: {
          type: "word",
          content,
          jp,
          phonetic,
          meanings,
          book: book || "Unsorted"
        },
      });
    }

    return NextResponse.json(saved);

  } catch (error) {
    console.error("SAVE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const content = new URL(req.url).searchParams.get("content");
    const items = await prisma.savedItem.findMany({
      where: { type: "word", ...(content !== null ? { content } : {}) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, { headers: { "Cache-Control": "private, no-store" } });
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
    const content = searchParams.get("content");

    await prisma.savedItem.deleteMany({
      where: {
        content: content || "",
        type: "word"
      }
    });

    return NextResponse.json({ message: "Deleted" });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (body.id !== undefined) {
      const { id, jp, note, example, exampleJP } = body;
      if (!Number.isInteger(id) || id <= 0 || typeof jp !== "string" || jp.length > 1000 ||
          [note, example, exampleJP].some(value => typeof value !== "string" || value.length > 3000)) {
        return NextResponse.json({ error: "Invalid edit" }, { status: 400 });
      }
      const existing = await prisma.savedItem.findFirst({ where: { id, type: "word" } });
      if (!existing) return NextResponse.json({ error: "Word not found" }, { status: 404 });
      const saved = await prisma.savedItem.update({ where: { id }, data: {
        jp, meanings: withNotes(existing.meanings, note, example, exampleJP),
      } });
      return NextResponse.json(saved);
    }
    const { content, book } = body;
    if (typeof content !== "string" || !content.trim() || !(await bookExists(book))) {
      return NextResponse.json({ error: "Invalid book move" }, { status: 400 });
    }
    await prisma.savedItem.updateMany({ where: { content, type: "word" }, data: { book } });
    return NextResponse.json({ message: "updated" });

  } catch (error) {
    console.error("PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}