import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { validatePhone, sanitizeInput } from "@/lib/validation";

const SEVERITY_EMOJI: Record<string, string> = {
  low: "🟡",
  medium: "🟠",
  high: "🔴",
  critical: "🚨",
};

const ALLOWED_SEVERITIES = new Set(["low", "medium", "high", "critical"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, condition, severity, location } = body;

    // Validate phone number
    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        { error: "A valid international phone number is required (e.g. +919876543210)." },
        { status: 400 }
      );
    }

    // Validate and sanitize other fields
    if (!condition || typeof condition !== "string") {
      return NextResponse.json({ error: "Condition is required." }, { status: 400 });
    }

    const sanitizedCondition = sanitizeInput(condition).slice(0, 200);
    const sanitizedLocation = location ? sanitizeInput(String(location)).slice(0, 200) : null;
    const sanitizedSeverity = ALLOWED_SEVERITIES.has(severity) ? severity : "unknown";

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const emoji = SEVERITY_EMOJI[sanitizedSeverity] || "⚠️";
    const locationText = sanitizedLocation ? `Location: ${sanitizedLocation}. ` : "";

    const message = `${emoji} CAMPUS EMERGENCY ALERT
Condition: ${sanitizedCondition}
Severity: ${sanitizedSeverity.toUpperCase()}
${locationText}
Someone nearby needs help. Please respond immediately or call campus security.

- Sent via CampusAid`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Twilio error:", err);
    return NextResponse.json(
      { error: "Failed to send alert. Please check the phone number and try again." },
      { status: 500 }
    );
  }
}
