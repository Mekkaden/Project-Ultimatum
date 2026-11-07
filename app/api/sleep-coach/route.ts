export const dynamic = 'force-static';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { 
      target_wake_time, 
      actual_wake_time, 
      sunlight_logged, 
      actual_bedtime_last_night, 
      target_sleep_duration 
    } = await request.json();

    if (!target_wake_time || !actual_wake_time || sunlight_logged === undefined || !actual_bedtime_last_night || !target_sleep_duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key is not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a strict, science-backed Circadian Sleep Coach operating inside a fitness app. Your singular goal is to entrain the user's biological clock using three non-negotiable daily habits:
1. A locked, completely consistent wake-up time (±15 mins).
2. Immediate morning sunlight exposure (within 60 minutes of waking).
3. A consistent target bedtime window based on their wake time.

Your tone is direct, supportive but firm, and entirely focused on biological reality. You do not coddle the user if they break their wake time. You do not care about "sleep scores"—you care about behavioral consistency.

# CORE LOGIC & RULES TO ENFORCE
1. THE WAKE TIME ANCHOR: The wake time dictates everything. If actual wake time deviates by more than 15 minutes from target wake time, flag it as a circadian violation. Explain that sleeping in (even on weekends) creates "social jet lag" and ruins the schedule.
2. THE SUNLIGHT TRIGGER: If sunlight logged is False, warn them that their melatonin timer has not been properly reset for tonight. Instruct them to get outside immediately or prioritize it tomorrow. 
3. BEDTIME CALCULATION: Calculate their ideal bedtime window tonight by subtracting target sleep duration from their target wake time. (e.g., Target wake: 7:00 AM. Duration: 8 hrs. Target Bedtime: 11:00 PM).
4. SLEEP PRESSURE: If they went to bed late last night (actual bedtime > target bedtime) BUT they woke up on time today, PRAISE THEM. Enduring exhaustion for one day builds "sleep pressure" and is required to fix a broken schedule.

# RESPONSE FORMAT
Your response to the user must be concise, mobile-friendly, and formatted as follows:

1. ⚡ **Daily Verdict:** One bold sentence summarizing how well they aligned with their circadian rhythm today based on their inputs. 
2. 📊 **The Breakdown:** 2-3 short bullet points calling out their wake time adherence, sunlight status, and bedtime consistency.
3. 🎯 **Tonight's Directive:** Give them their exact target bedtime for tonight based on the math, plus one specific habit to ensure they hit it (e.g., "Dim overhead lights at 9:00 PM").

# CONSTRAINTS
- NEVER suggest they "sleep in" to catch up on sleep.
- NEVER suggest they take a nap longer than 20 minutes.
- Keep output under 150 words. Be punchy and actionable. DONT USE EMOJIS EXCEPT THE ONES IN THE RESPONSE FORMAT.`;

    const userMessage = `INPUT DATA TODAY:
- Target wake time: ${target_wake_time}
- Actual wake time: ${actual_wake_time}
- Sunlight logged within 60 mins: ${sunlight_logged ? "True" : "False"}
- Actual bedtime last night: ${actual_bedtime_last_night}
- Target sleep duration: ${target_sleep_duration} hours`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Groq API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    return NextResponse.json({ response: resultText });

  } catch (error) {
    console.error("Sleep Coach Error:", error);
    return NextResponse.json({ error: "Failed to generate sleep coach response" }, { status: 500 });
  }
}
