import { describe, expect, it } from "vitest";
import { isValidCliVersion } from "./version.js";

describe("CLI version contract", () => {
  it("accepts the same strict SemVer forms as the release pipeline", () => {
    expect(isValidCliVersion("1.2.3")).toBe(true);
    expect(isValidCliVersion("1.2.3-rc.1")).toBe(true);
    expect(isValidCliVersion("1.2.3+build.7")).toBe(true);
  });

  it.each(["01.2.3", "1.2", "v1.2.3", "1.2.3-01", "latest", null])(
    "rejects invalid package version %j",
    (version) => {
      expect(isValidCliVersion(version)).toBe(false);
    },
  );
});
