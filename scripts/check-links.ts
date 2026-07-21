import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const roots = ["README.md", "README.pt-BR.md", "CONTRIBUTING.md", "SECURITY.md", "docs"];

async function collect(candidate: string, markdown: string[]): Promise<void> {
  const entries = await readdir(candidate, { withFileTypes: true });
  for (const entry of entries) {
    const resolved = path.join(candidate, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) await collect(resolved, markdown);
    else if (entry.isFile() && entry.name.endsWith(".md")) markdown.push(resolved);
  }
}

function inside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function headingAnchors(content: string): Set<string> {
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  for (const match of content.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
    const heading = match[1] ?? "";
    const explicit = /\s+\{#([a-zA-Z0-9_-]+)\}\s*$/.exec(heading)?.[1];
    const base =
      explicit ??
      heading
        .replace(/\s+\{#[a-zA-Z0-9_-]+\}\s*$/, "")
        .replace(/<[^>]+>/g, "")
        .replace(/[`*_~]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-");
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

export async function checkMarkdownLinks(
  markdown: readonly string[],
  vitepressRoot: string,
  displayRoot = process.cwd(),
): Promise<string[]> {
  const failures: string[] = [];
  const resolvedVitepressRoot = path.resolve(vitepressRoot);
  for (const source of markdown) {
    const file = path.resolve(source);
    const display =
      path.relative(displayRoot, file).split(path.sep).join("/") || path.basename(file);
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1];
      if (
        !href ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:")
      ) {
        continue;
      }
      let decoded: string;
      try {
        decoded = decodeURIComponent(href);
      } catch {
        failures.push(`${display}: malformed URL encoding in ${href}`);
        continue;
      }
      const [relative = "", fragment] = decoded.split("#", 2);
      const destination = relative
        ? relative.startsWith("/")
          ? path.join(resolvedVitepressRoot, relative.slice(1))
          : path.resolve(path.dirname(file), relative)
        : file;
      if (inside(resolvedVitepressRoot, file) && !inside(resolvedVitepressRoot, destination)) {
        failures.push(`${display}: ${href} escapes the VitePress source directory`);
        continue;
      }
      const candidates = [destination, `${destination}.md`, path.join(destination, "index.md")];
      let found: string | null = null;
      for (const candidate of candidates) {
        try {
          await access(candidate);
          found = candidate;
          break;
        } catch {
          // Try the next documented Markdown resolution form.
        }
      }
      if (!found) {
        failures.push(`${display}: ${href}`);
        continue;
      }
      if (fragment && found.endsWith(".md")) {
        const anchors = headingAnchors(await readFile(found, "utf8"));
        if (!anchors.has(fragment)) failures.push(`${display}: missing anchor ${href}`);
      }
    }
  }
  return failures;
}

export async function checkLinks(repository = path.resolve(".")): Promise<{
  checked: number;
  failures: string[];
}> {
  const markdown: string[] = [];
  for (const root of roots) {
    const resolved = path.join(repository, root);
    if (root.endsWith(".md")) markdown.push(resolved);
    else await collect(resolved, markdown);
  }
  return {
    checked: markdown.length,
    failures: await checkMarkdownLinks(markdown, path.join(repository, "docs"), repository),
  };
}

async function main(): Promise<void> {
  const result = await checkLinks();
  if (result.failures.length) {
    process.stderr.write(`Broken internal links:\n${result.failures.join("\n")}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`Checked paths and anchors in ${result.checked} Markdown files.\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await main();
