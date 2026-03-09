import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { query, mode } = await req.json();

    const history = await prisma.searchHistory.create({
      data: {
        query,
        mode,
      },
    });

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