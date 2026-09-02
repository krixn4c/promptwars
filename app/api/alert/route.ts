import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const { phone, condition, severity, location } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required." }, { status: 400 });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const severityEmoji: Record<string, string> = {
      low: "🟡",
      medium: "🟠",
      high: "🔴",
      critical: "🚨",
    };

    const emoji = severityEmoji[severity] || "⚠️";
    const locationText = location ? `Location: ${location}. ` : "";

    const message = `${emoji} CAMPUS EMERGENCY ALERT
Condition: ${condition}
Severity: ${severity.toUpperCase()}
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
      { error: "Failed to send alert. Check Twilio credentials." },
      { status: 500 }
    );
  }
}
