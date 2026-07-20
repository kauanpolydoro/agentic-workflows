import { describe, expect, it } from "vitest";
import { planAssetSync } from "./sync-github-release.js";

describe("resumable GitHub release synchronization", () => {
  it("separates verified, missing, and unexpected asset names", () => {
    expect(
      planAssetSync(["source.tgz", "source.zip", "checksums.txt"], ["source.tgz", "old.txt"]),
    ).toEqual({
      matching: ["source.tgz"],
      missing: ["checksums.txt", "source.zip"],
      unexpected: ["old.txt"],
    });
  });

  it("rejects ambiguous duplicate asset names", () => {
    expect(() => planAssetSync(["source.tgz", "source.tgz"], [])).toThrow(/unique/);
    expect(() => planAssetSync([], ["source.tgz", "source.tgz"])).toThrow(/unique/);
  });
});
