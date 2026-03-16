import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req:Request){

  const {text} = await req.json();

  const completion = await openai.chat.completions.create({

    model:"gpt-4o-mini",

    messages:[
      {
        role:"system",
        content:"You are a dictionary translator. Translate English definitions into short natural Japanese."
      },
      {
        role:"user",
        content:text
      }
    ],

    temperature:0.3
  });

  const result = completion.choices[0].message.content;

  return NextResponse.json({
    jp:result
  });

}