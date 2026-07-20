export interface DocumentationEnvironment {
  readonly [name: string]: string | undefined;
  readonly DOCS_BASE?: string;
  readonly DOCS_ORIGIN?: string;
  readonly GITHUB_REPOSITORY?: string;
  readonly GITHUB_REPOSITORY_OWNER?: string;
}

export function normalizeDocumentationBase(requestedBase: string): string {
  const normalized = requestedBase.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) return "/";
  if (normalized.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("DOCS_BASE must be a normalized URL path without traversal segments.");
  }
  if (/[?#]/.test(normalized)) {
    throw new Error("DOCS_BASE cannot contain a query string or fragment.");
  }
  return `/${normalized}/`;
}

export function documentationBase(environment: DocumentationEnvironment = process.env): string {
  const repositoryName = environment.GITHUB_REPOSITORY?.split("/")[1] || "agentic-workflows";
  return normalizeDocumentationBase(environment.DOCS_BASE ?? `/${repositoryName}/`);
}

export function documentationSiteUrl(environment: DocumentationEnvironment = process.env): URL {
  const repositoryOwner = environment.GITHUB_REPOSITORY_OWNER || "kauanpolydoro";
  const hostOrigin = environment.DOCS_ORIGIN ?? `https://${repositoryOwner}.github.io`;
  const origin = new URL(`${hostOrigin.replace(/\/+$/, "")}/`);
  if (origin.protocol !== "https:" && origin.protocol !== "http:") {
    throw new Error("DOCS_ORIGIN must use HTTP or HTTPS.");
  }
  return new URL(documentationBase(environment), origin);
}

export function documentationPageUrl(page: string, siteUrl: URL): string {
  const normalized = page.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized.split("/").some((segment) => segment === "." || segment === "..")) {
    throw new Error("Documentation page paths cannot contain traversal segments.");
  }
  const withoutExtension = normalized.replace(/\.(?:md|html)$/, "");
  const route =
    withoutExtension === "index"
      ? ""
      : withoutExtension.endsWith("/index")
        ? withoutExtension.slice(0, -"index".length)
        : withoutExtension;
  return new URL(route, siteUrl).href;
}
