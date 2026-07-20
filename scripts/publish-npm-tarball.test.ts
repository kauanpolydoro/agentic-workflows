import { describe, expect, it } from "vitest";
import {
  assertMatchingPublication,
  parsePublishedVersion,
  sha512Integrity,
} from "./publish-npm-tarball.js";

describe("resumable npm publication", () => {
  it("computes standard sha512 subresource integrity", () => {
    expect(sha512Integrity(Buffer.from("package tarball"))).toMatch(/^sha512-[A-Za-z0-9+/]+=*$/);
    expect(sha512Integrity(Buffer.from("package tarball"))).not.toBe(
      sha512Integrity(Buffer.from("different tarball")),
    );
  });

  it("accepts only the exact immutable package already in the registry", () => {
    const published = parsePublishedVersion(
      JSON.stringify({ version: "1.2.3", "dist.integrity": "sha512-exact" }),
    );
    expect(() => assertMatchingPublication("1.2.3", "sha512-exact", published)).not.toThrow();
    expect(() => assertMatchingPublication("1.2.3", "sha512-other", published)).toThrow(
      /different tarball content/,
    );
    expect(() => assertMatchingPublication("1.2.4", "sha512-exact", published)).toThrow(
      /expected 1\.2\.4/,
    );
  });

  it("rejects incomplete or malformed registry responses", () => {
    expect(() => parsePublishedVersion("not json")).toThrow(/invalid JSON/);
    expect(() => parsePublishedVersion(JSON.stringify({ version: "1.2.3" }))).toThrow(/omitted/);
  });
});
