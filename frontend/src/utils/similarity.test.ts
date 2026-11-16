import { describe, expect, it } from "vitest";
import { similarityBand, similarityLevel } from "./similarity";

describe("similarityLevel", () => {
  it.each([
    [0, "low"],
    [14, "low"],
    [15, "med"],
    [29, "med"],
    [30, "high"],
    [100, "high"],
  ] as const)("scores %i as %s", (score, level) => {
    expect(similarityLevel(score)).toBe(level);
  });
});

describe("similarityBand", () => {
  it("labels each level", () => {
    expect(similarityBand(7)).toBe("Low similarity");
    expect(similarityBand(23)).toBe("Moderate similarity");
    expect(similarityBand(44)).toBe("High similarity");
  });
});
