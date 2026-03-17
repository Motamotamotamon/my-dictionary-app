import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {

    const {
      content,
      jp,
      phonetic,
      meanings
    } = await req.json();

    const saved = await prisma.savedItem.create({
      data: {
        type: "word",
        content,
        jp,
        phonetic,
        meanings
      },
    });

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
    const id = Number(searchParams.get("id"));

    await prisma.savedItem.delete({
      where: { id }
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
export async function PATCH(req: Request) {
  try {

    const { content, book } = await req.json();

    await prisma.savedItem.updateMany({
      where: {
        content: content
      },
      data: {
        book: book
      }
    });

    return NextResponse.json({ message:"updated" });

  } catch (error) {

    console.error("PATCH ERROR:", error);

    return NextResponse.json(
      { error:"Failed to update book" },
      { status:500 }
    );

  }
}



