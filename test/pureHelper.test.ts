import { describe, it, expect } from "vitest";
import { parsePair } from "./../src/services/price.service";

describe("parsePair", () => {
  it("parses USDINR", () => {
    expect(parsePair("USDINR")).toEqual({ base: "usd", quote: "inr" });
  });

  it("parses USD/INR", () => {
    expect(parsePair("USD/INR")).toEqual({ base: "usd", quote: "inr" });
  });

  it("throws on invalid length", () => {
    expect(() => parsePair("USDI")).toThrow();
  });
});