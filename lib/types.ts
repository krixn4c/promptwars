// Type definitions for CampusAid

export interface FirstAidResponse {
  condition: string;
  severity: "low" | "medium" | "high" | "critical";
  steps: string[];
  doNot: string[];
  callEmergencyIf: string[];
  estimatedTime: string;
  translatedSummary: string;
  disclaimer: string;
}

export interface AlertPayload {
  phone: string;
  condition: string;
  severity: string;
  location?: string;
}
