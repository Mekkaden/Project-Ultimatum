export const dynamic = 'force-static';
import { NextResponse } from 'next/server';

export const maxDuration = 30; // Max execution time for Vercel

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is missing" }, { status: 500 });
    }

    // Strip out the data:image/jpeg;base64, prefix if it exists
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const actualMimeType = mimeType || "image/jpeg";

    const prompt = `Analyze this image of food. Identify the primary ingredients and critically estimate the exact nutritional value for ONLY the specific portion size shown.
    Pay extremely close attention to context clues like packaging sizes, text on the wrapper (e.g. "Rs 10", net weight), hand sizes, plates, or bowls to determine the exact quantity. If it is a small single-serving packet, do NOT output the calories for a large family pack. Be as precise and highly accurate as possible for the exact volume seen in the picture.
    
    You MUST return ONLY a valid JSON object with the following exact keys and number values. Do not wrap it in markdown block quotes.
    {
      "foodName": "string describing the specific meal or package",
      "calories": number (total kcal),
      "protein": number (in grams),
      "carbs": number (in grams),
      "fats": number (in grams)
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: actualMimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: "Failed to communicate with AI vision model" }, { status: 500 });
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsed = JSON.parse(textResponse);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", textResponse);
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

  } catch (error) {
    console.error("Image Scan Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
