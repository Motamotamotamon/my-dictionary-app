import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const { word } = await req.json();

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content:
            "You are an English teacher for Japanese learners."
        },
        {
          role: "user",
          content: `
Explain this English word for a Japanese learner.

word: ${word}

Return JSON:

{
meaning: "",
nuance: "",
example: "",
exampleJP: ""
}
`
        }
      ],

      response_format:{type:"json_object"}

    });

    const text = completion.choices[0].message.content;

    return NextResponse.json(JSON.parse(text!));

  } catch(err) {

    console.error(err);

    return NextResponse.json(
      {error:"AI error"},
      {status:500}
    );

  }

}