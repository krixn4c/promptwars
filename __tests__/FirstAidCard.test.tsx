import { render, screen } from "@testing-library/react";
import FirstAidCard from "@/components/FirstAidCard";
import type { FirstAidResponse } from "@/lib/types";

const mockLowResult: FirstAidResponse = {
  condition: "Minor Cut",
  severity: "low",
  steps: ["Clean the wound with water", "Apply a bandage"],
  doNot: ["Do not use dirty cloth"],
  callEmergencyIf: ["Bleeding does not stop after 10 minutes"],
  estimatedTime: "2-3 minutes",
  translatedSummary: "Clean and bandage the wound.",
  disclaimer: "This is AI-generated guidance. Consult a doctor for serious injuries.",
};

const mockCriticalResult: FirstAidResponse = {
  condition: "Cardiac Arrest",
  severity: "critical",
  steps: ["Call 911 immediately", "Begin CPR"],
  doNot: ["Do not leave the person alone"],
  callEmergencyIf: ["Person is unresponsive"],
  estimatedTime: "Ongoing until help arrives",
  translatedSummary: "Call emergency services immediately.",
  disclaimer: "This is AI-generated guidance. Call 911 now.",
};

describe("FirstAidCard", () => {
  it("renders the condition name", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText("Minor Cut")).toBeInTheDocument();
  });

  it("renders all steps", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText("Clean the wound with water")).toBeInTheDocument();
    expect(screen.getByText("Apply a bandage")).toBeInTheDocument();
  });

  it("renders do not items", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText("Do not use dirty cloth")).toBeInTheDocument();
  });

  it("renders estimated time", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText(/2-3 minutes/)).toBeInTheDocument();
  });

  it("renders emergency triggers", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText("Bleeding does not stop after 10 minutes")).toBeInTheDocument();
  });

  it("renders translated summary", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText("Clean and bandage the wound.")).toBeInTheDocument();
  });

  it("renders disclaimer", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(
      screen.getByText(/AI-generated guidance/i)
    ).toBeInTheDocument();
  });

  it("shows LOW badge for low severity", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText(/LOW/)).toBeInTheDocument();
  });

  it("shows CRITICAL badge for critical severity", () => {
    render(<FirstAidCard result={mockCriticalResult} />);
    expect(screen.getByText(/CRITICAL/)).toBeInTheDocument();
  });

  it("renders steps heading", () => {
    render(<FirstAidCard result={mockLowResult} />);
    expect(screen.getByText(/Steps to Follow/i)).toBeInTheDocument();
  });
});
