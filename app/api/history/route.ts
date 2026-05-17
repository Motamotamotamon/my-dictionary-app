import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {

    const { query, mode } = await req.json();

    // 同じ単語の履歴を全部削除
    await prisma.searchHistory.deleteMany({
      where: { query }
    });

    // 新しく保存（最新になる）
    const history = await prisma.searchHistory.create({
      data: {
        query,
        mode,
      },
    });

    // 履歴が多すぎたら古いの削除
const all = await prisma.searchHistory.findMany({
  orderBy:{createdAt:"desc"}
});

if(all.length > 20){
  const remove = all.slice(20);

  for(const r of remove){
    await prisma.searchHistory.delete({
      where:{id:r.id}
    });
  }
}

    return NextResponse.json(history);

  } catch (error) {
    console.error("POST HISTORY ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save history" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const histories = await prisma.searchHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(histories);
  } catch (error) {
    console.error("GET HISTORY ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}