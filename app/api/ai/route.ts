import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { word, id } = await req.json();

    // ① 既存データ確認
    const existing = await prisma.word.findUnique({
      where: { id },
    });

    if (existing?.aiAnalysis) {
      return NextResponse.json(existing.aiAnalysis);
    }

    // ② プロンプト作成
    const prompt = `
You are an English linguistics expert.

For the word: "${word}"

Respond ONLY in valid JSON format like this:

{
  "idioms": [
    {
      "expression": "",
      "meaning": "",
      "example": ""
    }
  ],
  "usage": {
    "frequency": "very common / common / rare",
    "formality": "formal / neutral / casual",
    "notes": ""
  },
  "translation": {
    "literal_japanese": "",
    "medical_context": "",
    "casual_context": ""
  },
  "native_warning": {
    "is_natural": true,
    "explanation": ""
  }
}
`;

    // ③ OpenAI呼び出し
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a helpful linguistics assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("OPENAI RAW RESPONSE:", data);

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    // ④ DB保存
    await prisma.word.update({
      where: { id },
      data: {
        aiAnalysis: parsed,
      },
    });

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}
