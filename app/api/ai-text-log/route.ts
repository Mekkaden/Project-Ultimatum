import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key is not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an elite fitness nutrition AI. 
Extract the nutritional information from the user's food description. 
Return ONLY a valid JSON object with exactly these keys: 
"calories" (number), "protein" (number), "carbs" (number), "fats" (number), and "foodName" (string). 
If quantities are given, calculate the macros accordingly. If the food is generic and no quantity is given, estimate for a standard serving.
DO NOT wrap the response in markdown, backticks, or add any conversational text. Return raw JSON only.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Groq API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    try {
      const parsedData = JSON.parse(resultText);
      return NextResponse.json(parsedData);
    } catch (e) {
      console.error("Failed to parse Groq response:", resultText);
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

  } catch (error) {
    console.error("AI Text Log Error:", error);
    return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
  }
}
