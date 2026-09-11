import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FirstAidResponse } from "@/lib/types";
import { sanitizeInput, validateTextInput, validateImageFile } from "@/lib/validation";

const ALLOWED_LANGUAGES = new Set([
  "English", "Hindi", "Spanish", "French", "Tamil", "Telugu",
]);

// Model chain: try in order on 503 overload errors
const MODEL_CHAIN = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-8b",
];

const SYSTEM_PROMPT = (language: string) => `
You are CampusAid, an emergency first-aid assistant for college campuses.
Given a description or image of a medical situation or safety hazard, respond ONLY with valid JSON — no markdown, no code blocks, just raw JSON.

Rules:
- Be calm, clear, and practical
- Steps must be actionable by a layperson with no medical training
- Always include a disclaimer
- If the situation is life-threatening, make callEmergencyIf very clear
- The "translatedSummary" field must be a brief 2-3 sentence summary written in ${language}

Respond with ONLY this JSON (no extra text):
{
  "condition": "name of the condition or hazard",
  "severity": "low",
  "steps": ["step 1", "step 2"],
  "doNot": ["thing 1"],
  "callEmergencyIf": ["condition 1"],
  "estimatedTime": "2-3 minutes",
  "translatedSummary": "brief summary in ${language}",
  "disclaimer": "This is AI-generated first aid guidance. Always call emergency services for serious injuries."
}

severity must be one of: low, medium, high, critical
`;

/** Call Gemini with retry across model chain on 503 overload */
async function callGeminiWithFallback(
  apiKey: string,
  language: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parts: any[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const requestConfig = {
    contents: [{ role: "user" as const, parts }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
  };

  let lastError: Error = new Error("No model available");

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT(language),
        });
        const result = await model.generateContent(requestConfig);
        return result.response.text().trim();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        lastError = e instanceof Error ? e : new Error(msg);

        const isOverload =
          msg.includes("503") ||
          msg.includes("overload") ||
          msg.includes("Service Unavailable") ||
          msg.includes("high demand");

        if (!isOverload) {
          // Not a capacity error — throw immediately, no point trying other models
          throw lastError;
        }

        // Overload: wait before retry (1s first attempt, skip wait on last attempt of last model)
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rawText = formData.get("text") as string | null;
    const imageFile = formData.get("image") as File | null;
    const rawLanguage = (formData.get("language") as string) || "English";

    const language = ALLOWED_LANGUAGES.has(rawLanguage) ? rawLanguage : "English";

    if (!rawText && !imageFile) {
      return NextResponse.json(
        { error: "Please provide text or an image." },
        { status: 400 }
      );
    }

    if (rawText && !validateTextInput(rawText)) {
      return NextResponse.json(
        { error: "Text must be between 1 and 1000 characters." },
        { status: 400 }
      );
    }

    if (imageFile) {
      const imageValidation = validateImageFile(imageFile);
      if (!imageValidation.valid) {
        return NextResponse.json({ error: imageValidation.error }, { status: 400 });
      }
    }

    const text = rawText ? sanitizeInput(rawText) : null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing API key." },
        { status: 500 }
      );
    }

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

    const responseText = await callGeminiWithFallback(apiKey, language, parts);

    // Strip markdown code fences if model wraps the JSON
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: FirstAidResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Invalid JSON from Gemini:", responseText);
      return NextResponse.json(
        { error: "AI returned an unexpected response format. Please try again." },
        { status: 500 }
      );
    }

    if (!parsed.condition || !parsed.severity || !Array.isArray(parsed.steps)) {
      return NextResponse.json(
        { error: "Incomplete response from AI. Please try again." },
        { status: 500 }
      );
    }

    parsed.doNot = parsed.doNot ?? [];
    parsed.callEmergencyIf = parsed.callEmergencyIf ?? [];

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini API error:", message);

    if (message.includes("API_KEY_INVALID") || message.includes("401")) {
      return NextResponse.json(
        { error: "Invalid Gemini API key. Please check your .env.local file." },
        { status: 500 }
      );
    }

    if (message.includes("503") || message.includes("high demand") || message.includes("Service Unavailable")) {
      return NextResponse.json(
        { error: "Gemini AI is temporarily overloaded. Please wait a few seconds and try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
