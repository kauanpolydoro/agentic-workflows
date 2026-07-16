import { afterEach, describe, expect, it, vi } from "vitest";
import {
  documentationBase,
  documentationPageUrl,
  documentationSiteUrl,
  normalizeDocumentationBase,
} from "./docs-site.js";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("documentation site URLs", () => {
  it.each([
    ["/", "/"],
    ["", "/"],
    ["///", "/"],
    ["agentic-workflows", "/agentic-workflows/"],
    ["/agentic-workflows/", "/agentic-workflows/"],
  ])("normalizes base %j as %j", (input, expected) => {
    expect(normalizeDocumentationBase(input)).toBe(expected);
  });

  it("builds clean root and project URLs", () => {
    const root = documentationSiteUrl({
      DOCS_BASE: "/",
      DOCS_ORIGIN: "https://docs.example.test",
    });
    expect(documentationBase({ DOCS_BASE: "/" })).toBe("/");
    expect(root.href).toBe("https://docs.example.test/");
    expect(documentationPageUrl("index.md", root)).toBe("https://docs.example.test/");
    expect(documentationPageUrl("catalog/index.md", root)).toBe(
      "https://docs.example.test/catalog/",
    );
    expect(documentationPageUrl("catalog/review-pull-request.md", root)).toBe(
      "https://docs.example.test/catalog/review-pull-request",
    );
  });

  it("derives a fork-safe project URL from GitHub environment variables", () => {
    const forkEnvironment = {
      GITHUB_REPOSITORY: "example-owner/example-fork",
      GITHUB_REPOSITORY_OWNER: "example-owner",
    };

    expect(documentationBase(forkEnvironment)).toBe("/example-fork/");
    expect(documentationSiteUrl(forkEnvironment).href).toBe(
      "https://example-owner.github.io/example-fork/",
    );
  });

  it("loads the VitePress config at the root with one dynamic page URL contract", async () => {
    vi.stubEnv("DOCS_BASE", "/");
    vi.stubEnv("DOCS_ORIGIN", "https://docs.example.test");
    vi.resetModules();
    const loaded = await import("../docs/.vitepress/config.js");
    const config = loaded.default as {
      base?: string;
      head?: Array<[string, Record<string, string>] | [string, Record<string, string>, string]>;
      sitemap?: { hostname?: string };
      transformHead?: (context: {
        page: string;
        title: string;
        description: string;
      }) => Promise<unknown> | unknown;
    };
    expect(config.base).toBe("/");
    expect(config.sitemap?.hostname).toBe("https://docs.example.test/");
    expect(config.head).not.toEqual(
      expect.arrayContaining([["link", expect.objectContaining({ rel: "canonical" })]]),
    );
    expect(config.head).not.toEqual(
      expect.arrayContaining([["meta", expect.objectContaining({ property: "og:url" })]]),
    );
    const pageHead = (await config.transformHead?.({
      page: "catalog/review-pull-request.md",
      title: "Review a pull request",
      description: "Review one immutable change set.",
    })) as Array<[string, Record<string, string>]>;
    expect(pageHead).toEqual([
      [
        "link",
        {
          rel: "canonical",
          href: "https://docs.example.test/catalog/review-pull-request",
        },
      ],
      [
        "meta",
        {
          property: "og:url",
          content: "https://docs.example.test/catalog/review-pull-request",
        },
      ],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:title", content: "Review a pull request" }],
      [
        "meta",
        {
          property: "og:description",
          content: "Review one immutable change set.",
        },
      ],
      [
        "meta",
        {
          property: "og:image",
          content: "https://docs.example.test/social-preview.png",
        },
      ],
      ["meta", { name: "twitter:title", content: "Review a pull request" }],
      ["meta", { name: "twitter:description", content: "Review one immutable change set." }],
      ["meta", { name: "twitter:image", content: "https://docs.example.test/social-preview.png" }],
    ]);
  });
});
