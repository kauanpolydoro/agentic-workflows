import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const markdownRoots = [
  "README.md",
  "README.pt-BR.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "docs",
  "release-notes",
];
const allowedHosts = new Set([
  "code.claude.com",
  "cursor.com",
  "docs.npmjs.com",
  "geminicli.com",
  "github.com",
  "kauanpolydoro.github.io",
  "learn.chatgpt.com",
  "opencode.ai",
  "raw.githubusercontent.com",
  "www.npmjs.com",
]);
const maximumCacheBytes = 1024 * 1024;

export interface ExternalLinkResult {
  url: string;
  finalUrl: string;
  status: number | null;
  ok: boolean;
  detail: string;
}

interface CacheEntry {
  checkedAt: string;
  result: ExternalLinkResult;
}

interface ExternalLinkCache {
  schemaVersion: 1;
  entries: Record<string, CacheEntry>;
}

interface AuditOptions {
  cachePath: string;
  cacheHours: number;
  concurrency: number;
  timeoutMs: number;
}

interface RequestOptions {
  timeoutMs: number;
  maximumRedirects?: number;
  fetcher?: typeof fetch;
}

function reachableStatus(status: number): boolean {
  return (status >= 200 && status < 400) || [401, 403, 429].includes(status);
}

export function extractExternalLinks(content: string): string[] {
  const links = new Set<string>();
  for (const match of content.matchAll(
    /\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
  )) {
    if (match[1]) links.add(match[1]);
  }
  return [...links].sort();
}

async function collectMarkdown(candidate: string, files: string[]): Promise<void> {
  const information = await stat(candidate);
  if (information.isFile()) {
    files.push(candidate);
    return;
  }
  for (const entry of await readdir(candidate, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const resolved = path.join(candidate, entry.name);
    if (entry.isDirectory()) await collectMarkdown(resolved, files);
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(resolved);
  }
}

async function catalogExternalLinks(repository: string): Promise<string[]> {
  const files: string[] = [];
  for (const root of markdownRoots) await collectMarkdown(path.join(repository, root), files);
  const links = new Set<string>();
  for (const file of files) {
    for (const link of extractExternalLinks(await readFile(file, "utf8"))) links.add(link);
  }
  return [...links].sort();
}

async function request(
  url: string,
  method: "HEAD" | "GET",
  options: Required<RequestOptions>,
): Promise<{ finalUrl: string; status: number }> {
  let current = url;
  for (let redirects = 0; redirects <= options.maximumRedirects; redirects += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    let response: Response;
    try {
      response = await options.fetcher(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "agentic-workflows-link-audit/0.1",
          ...(method === "GET" ? { range: "bytes=0-0" } : {}),
        },
      });
    } finally {
      clearTimeout(timer);
    }
    if (response.status < 300 || response.status >= 400) {
      return { finalUrl: current, status: response.status };
    }
    const location = response.headers.get("location");
    if (!location) return { finalUrl: current, status: response.status };
    if (redirects === options.maximumRedirects) throw new Error("redirect limit exceeded");
    const redirected = new URL(location, current);
    if (!allowedHosts.has(redirected.hostname)) {
      throw new Error(`redirect host is not allowlisted: ${redirected.hostname}`);
    }
    current = redirected.href;
  }
  throw new Error("redirect limit exceeded");
}

export async function inspectExternalLink(
  url: string,
  options: RequestOptions,
): Promise<ExternalLinkResult> {
  const complete: Required<RequestOptions> = {
    timeoutMs: options.timeoutMs,
    maximumRedirects: options.maximumRedirects ?? 5,
    fetcher: options.fetcher ?? fetch,
  };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url, finalUrl: url, status: null, ok: false, detail: "invalid URL" };
  }
  if (!allowedHosts.has(parsed.hostname)) {
    return {
      url,
      finalUrl: url,
      status: null,
      ok: false,
      detail: `host is not allowlisted: ${parsed.hostname}`,
    };
  }
  try {
    let response = await request(url, "HEAD", complete);
    if (response.status === 405) response = await request(url, "GET", complete);
    return {
      url,
      finalUrl: response.finalUrl,
      status: response.status,
      ok: reachableStatus(response.status),
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      status: null,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function loadCache(file: string): Promise<ExternalLinkCache> {
  try {
    if ((await stat(file)).size > maximumCacheBytes) throw new Error("cache exceeds 1 MiB");
    const value = JSON.parse(await readFile(file, "utf8")) as ExternalLinkCache;
    if (value.schemaVersion !== 1 || typeof value.entries !== "object" || value.entries === null) {
      throw new Error("cache schema is invalid");
    }
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { schemaVersion: 1, entries: {} };
    }
    throw error;
  }
}

async function saveCache(file: string, cache: ExternalLinkCache): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(cache, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

function isFresh(entry: CacheEntry | undefined, cacheHours: number): entry is CacheEntry {
  if (!entry?.result.ok) return false;
  const age = Date.now() - Date.parse(entry.checkedAt);
  return Number.isFinite(age) && age >= 0 && age <= cacheHours * 60 * 60 * 1000;
}

async function mapConcurrent<Input, Output>(
  values: readonly Input[],
  concurrency: number,
  operation: (value: Input) => Promise<Output>,
): Promise<Output[]> {
  const results = new Array<Output>(values.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await operation(values[index] as Input);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

export async function auditExternalLinks(
  repository: string,
  options: AuditOptions,
): Promise<{ checked: number; cached: number; results: ExternalLinkResult[] }> {
  const links = await catalogExternalLinks(repository);
  const cache = await loadCache(options.cachePath);
  let cached = 0;
  const results = await mapConcurrent(links, options.concurrency, async (link) => {
    const retained = cache.entries[link];
    if (isFresh(retained, options.cacheHours)) {
      cached += 1;
      return retained.result;
    }
    const result = await inspectExternalLink(link, { timeoutMs: options.timeoutMs });
    cache.entries[link] = { checkedAt: new Date().toISOString(), result };
    return result;
  });
  await saveCache(options.cachePath, cache);
  return { checked: links.length, cached, results };
}

function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} must be positive.`);
  return parsed;
}

async function main(): Promise<void> {
  const repository = path.resolve(".");
  const result = await auditExternalLinks(repository, {
    cachePath: path.resolve(process.env.AWF_EXTERNAL_LINK_CACHE ?? ".cache/external-links.json"),
    cacheHours: positiveInteger(process.env.AWF_EXTERNAL_LINK_CACHE_HOURS, 24, "cache hours"),
    concurrency: positiveInteger(process.env.AWF_EXTERNAL_LINK_CONCURRENCY, 4, "concurrency"),
    timeoutMs: positiveInteger(process.env.AWF_EXTERNAL_LINK_TIMEOUT_MS, 10_000, "timeout"),
  });
  const failures = result.results.filter((entry) => !entry.ok);
  if (failures.length > 0) {
    process.stderr.write(
      `External link audit failed:\n${failures.map((entry) => `${entry.url}: ${entry.detail}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Checked ${result.checked} allowlisted external links; ${result.cached} used a fresh cache record.\n`,
  );
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
