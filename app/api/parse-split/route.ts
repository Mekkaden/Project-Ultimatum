export const dynamic = 'force-static';
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert workout split parser integrated into a fitness app called Project Ultimatum.

The user will paste a workout program in ANY format — from FitNotes exports, coach plans, Reddit posts, spreadsheets, or plain text.

Your job: parse it into structured JSON. Follow these rules strictly:
1. Include BOTH training days AND rest days.
2. For rest days, set "isRestDay": true, "exercises": [].
3. For training days, extract exercise name, sets, and RIR (Reps In Reserve). If RIR not specified, default to "2-1".
4. If the user gives reps (e.g. "3x10"), convert to targetRIR = "2-1" by default since this app uses RIR.
5. Day titles should be descriptive (e.g. "Push Day", "Upper Body A", "Legs", "REST").
6. Do not invent exercises that aren't in the text.
6b. Copy each exercise name exactly as the user wrote it. Never expand or clean abbreviations ("RDL" stays "RDL", "Incline DB Press" stays "Incline DB Press", "Pullups" stays "Pullups").
7. Parse as many days as you can find.

Return ONLY this exact JSON structure, nothing else, no markdown, no explanation:
{"days":[{"title":"Push Day","isRestDay":false,"exercises":[{"name":"Bench Press","sets":4,"targetRIR":"2-1"}]},{"title":"REST","isRestDay":true,"exercises":[]}]}`;

export async function POST(req: Request) {
  try {
    const { splitText } = await req.json();

    if (!splitText || typeof splitText !== "string" || splitText.trim().length < 5) {
      return NextResponse.json({ error: "No split text provided." }, { status: 400 });
    }

    if (splitText.length > 8000) {
      return NextResponse.json({ error: "Split text is too long. Please trim it down." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured." }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: splitText.trim() },
        ],
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return NextResponse.json({ error: "AI service error. Try again." }, { status: 502 });
    }

    const data = await response.json();
    const rawOutput: string = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON object from response (in case model adds stray text)
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI returned non-JSON:", rawOutput);
      return NextResponse.json(
        { error: "AI could not parse the split. Try pasting it in a cleaner format." },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.days || !Array.isArray(parsed.days)) {
      return NextResponse.json(
        { error: "AI returned unexpected structure. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({ days: parsed.days });
  } catch (error: any) {
    console.error("parse-split error:", error);
    return NextResponse.json({ error: "Failed to parse split. Please try again." }, { status: 500 });
  }
}
