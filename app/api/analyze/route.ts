import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FirstAidResponse } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = (language: string) => `
You are CampusAid, an emergency first-aid assistant for college campuses.
Given a description or image of a medical situation or safety hazard, respond ONLY with valid JSON.

Rules:
- Be calm, clear, and practical
- Steps must be actionable by a layperson with no medical training
- Always include a disclaimer
- If the situation is life-threatening, make callEmergencyIf very clear
- The "translatedSummary" field must be a brief 2-3 sentence summary written in ${language}

Respond with this exact JSON shape:
{
  "condition": "string - name of the condition/hazard",
  "severity": "low | medium | high | critical",
  "steps": ["array of step-by-step first aid instructions"],
  "doNot": ["array of things NOT to do"],
  "callEmergencyIf": ["conditions that require calling 911/emergency services"],
  "estimatedTime": "string - estimated time to perform first aid e.g. '3-5 minutes'",
  "translatedSummary": "string - brief summary in ${language}",
  "disclaimer": "This is AI-generated first aid guidance. Always call emergency services for serious injuries."
}
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const imageFile = formData.get("image") as File | null;
    const language = (formData.get("language") as string) || "English";

    if (!text && !imageFile) {
      return NextResponse.json(
        { error: "Please provide text or an image." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [];

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      parts.push({
        inlineData: {
          mimeType: imageFile.type as "image/jpeg" | "image/png" | "image/webp",
          data: base64,
        },
      });
    }

    const userText = text
      ? `Emergency situation: ${text}`
      : "Analyze this image and identify the medical emergency or safety hazard shown.";

    parts.push({ text: userText });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      systemInstruction: SYSTEM_PROMPT(language),
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = result.response.text();
    const parsed: FirstAidResponse = JSON.parse(rawText);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Failed to analyze the situation. Please try again." },
      { status: 500 }
    );
  }
}
