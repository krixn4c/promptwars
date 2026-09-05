import { validatePhone, validateTextInput, sanitizeInput } from "@/lib/validation";

describe("validatePhone", () => {
  it("accepts valid international phone numbers", () => {
    expect(validatePhone("+919876543210")).toBe(true);
    expect(validatePhone("+12345678900")).toBe(true);
    expect(validatePhone("+447911123456")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(validatePhone("")).toBe(false);
  });

  it("rejects phone without country code", () => {
    expect(validatePhone("9876543210")).toBe(false);
  });

  it("rejects too-short numbers", () => {
    expect(validatePhone("+1234")).toBe(false);
  });

  it("rejects phone with letters", () => {
    expect(validatePhone("+1abc456789")).toBe(false);
  });
});

describe("validateTextInput", () => {
  it("accepts valid emergency description", () => {
    expect(validateTextInput("Someone fainted in the library")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(validateTextInput("")).toBe(false);
  });

  it("rejects whitespace only", () => {
    expect(validateTextInput("   ")).toBe(false);
  });

  it("rejects text over 1000 characters", () => {
    expect(validateTextInput("a".repeat(1001))).toBe(false);
  });

  it("accepts text at exactly 1000 characters", () => {
    expect(validateTextInput("a".repeat(1000))).toBe(true);
  });
});

describe("sanitizeInput", () => {
  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("removes script tags", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).not.toContain("<script>");
  });

  it("removes HTML tags", () => {
    expect(sanitizeInput("<b>bold</b>")).toBe("bold");
  });

  it("preserves normal text", () => {
    expect(sanitizeInput("Someone is bleeding")).toBe("Someone is bleeding");
  });
});
