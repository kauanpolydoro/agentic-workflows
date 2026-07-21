import { describe, expect, it, vi } from "vitest";
import { extractExternalLinks, inspectExternalLink } from "./check-external-links.js";

describe("external link audit", () => {
  it("extracts unique Markdown links without treating plain example URLs as links", () => {
    expect(
      extractExternalLinks(
        "[GitHub](https://github.com/example/project)\nhttps://registry.example.test/pkg\n[Again](https://github.com/example/project)\n",
      ),
    ).toEqual(["https://github.com/example/project"]);
  });

  it("rejects hosts outside the explicit audit allowlist without a request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    await expect(
      inspectExternalLink("https://registry.example.test/pkg", {
        timeoutMs: 100,
        fetcher,
      }),
    ).resolves.toMatchObject({
      ok: false,
      status: null,
      detail: "host is not allowlisted: registry.example.test",
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    "https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows",
    "https://docs.npmjs.com/about-package-readme-files/",
    "https://raw.githubusercontent.com/kauanpolydoro/agentic-workflows/main/docs/public/terminal-demo.svg",
  ])("allows an official documentation or package URL at %s", async (url) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));

    await expect(inspectExternalLink(url, { timeoutMs: 100, fetcher })).resolves.toMatchObject({
      ok: true,
      status: 200,
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("follows bounded redirects and falls back from HEAD to a ranged GET", async () => {
    const calls: Array<{ method: string; url: string }> = [];
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      const method = String(init?.method);
      calls.push({ method, url });
      if (url.endsWith("/start")) {
        return new Response(null, {
          status: 302,
          headers: { location: "/final" },
        });
      }
      return method === "HEAD" ? new Response(null, { status: 405 }) : new Response("ok");
    });

    await expect(
      inspectExternalLink("https://github.com/start", { timeoutMs: 100, fetcher }),
    ).resolves.toMatchObject({
      ok: true,
      status: 200,
      finalUrl: "https://github.com/final",
    });
    expect(calls).toEqual([
      { method: "HEAD", url: "https://github.com/start" },
      { method: "HEAD", url: "https://github.com/final" },
      { method: "GET", url: "https://github.com/start" },
      { method: "GET", url: "https://github.com/final" },
    ]);
  });

  it("reports an abort when the request exceeds its timeout", async () => {
    const fetcher = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("request aborted")), {
            once: true,
          });
        }),
    );

    await expect(
      inspectExternalLink("https://github.com/slow", { timeoutMs: 5, fetcher }),
    ).resolves.toMatchObject({ ok: false, status: null, detail: "request aborted" });
  });
});
