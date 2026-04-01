import { NextResponse } from "next/server";
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
          meanings,
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

export async function GET() {
  try {
    const items = await prisma.savedItem.findMany({
      where: { type: "word" },
      orderBy: { createdAt: "desc" },
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
    const { content, book } = await req.json();

    await prisma.savedItem.updateMany({
      where: {
        content,
        type: "word"
      },
      data: {
        book: book || "Unsorted"
      }
    });

    return NextResponse.json({ message: "updated" });

  } catch (error) {
    console.error("PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}