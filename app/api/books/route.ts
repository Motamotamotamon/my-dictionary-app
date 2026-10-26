import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listBooks } from "@/lib/book-store";
import { validBookName } from "@/lib/books";
export async function GET() {
  try { return NextResponse.json(await listBooks(), { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Bookを読み込めませんでした。" }, { status: 500 }); }
}
async function write(req: Request, rename: boolean) {
  try {
    const body = await req.json();
    if (!validBookName(body.name)) return NextResponse.json({ error: "名前は1〜60文字で入力してください。" }, { status: 400 });
    const name = body.name.trim();
    const books = await listBooks();
    if (rename && (typeof body.id !== "string" || !books.some(book => book.id === body.id))) return NextResponse.json({ error: "Bookが見つかりません。" }, { status: 404 });
    if (books.some(book => book.id !== (rename ? body.id : null) && book.name.normalize("NFKC").toLowerCase() === name.normalize("NFKC").toLowerCase())) {
      return NextResponse.json({ error: "同じ名前のBookがあります。" }, { status: 409 });
    }
    const id = rename ? body.id : `book:${randomUUID()}`;
    const result = rename ? await prisma.savedItem.updateMany({ where: { type: "book", content: id }, data: { jp: name } }) : { count: 0 };
    if (!result.count) await prisma.savedItem.create({ data: { type: "book", content: id, jp: name } });
    return NextResponse.json({ id, name });
  } catch { return NextResponse.json({ error: "Bookを保存できませんでした。" }, { status: 500 }); }
}
export async function POST(req: Request) { return write(req, false); }
export async function PATCH(req: Request) { return write(req, true); }
