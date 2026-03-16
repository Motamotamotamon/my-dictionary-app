import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  const { word } = await req.json();

  const completion = await openai.chat.completions.create({

    model: "gpt-4o-mini",

    messages: [
      {
        role: "system",
        content: "You are an English teacher."
      },
      {
        role: "user",
        content: `
Create 3 short English example sentences using the word "${word}".

Return JSON format:

[
 { "en":"...", "jp":"..." },
 { "en":"...", "jp":"..." },
 { "en":"...", "jp":"..." }
]
`
      }
    ],

    temperature:0.7

  });

  const text = completion.choices[0].message.content || "[]";

  return NextResponse.json(JSON.parse(text));

}