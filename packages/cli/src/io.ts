import { AwfError, sanitizeTerminal } from "@kauanpolydoro/agentic-workflows-core";
import { errorContractMetadata } from "./error-contract.js";

export function output(value: unknown, json = false): void {
  if (json) process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else process.stdout.write(`${sanitizeTerminal(String(value))}\n`);
}

function humanError(value: {
  message: string;
  code?: unknown;
  details?: Record<string, unknown>;
  remediation?: string;
}): string {
  const lines = [
    value.code === undefined
      ? `Error: ${value.message}`
      : `Error [${String(value.code)}]: ${value.message}`,
  ];
  const issues = Array.isArray(value.details?.issues)
    ? (value.details.issues as Array<Record<string, unknown>>)
    : [];
  if (issues.length > 0) {
    lines.push("Details:");
    for (const issue of issues) {
      const code = typeof issue.code === "string" ? issue.code : "ISSUE";
      const location = typeof issue.path === "string" ? ` at ${issue.path}` : "";
      lines.push(`- [${code}]${location}`);
      if (typeof issue.remediation === "string") lines.push(`  Fix: ${issue.remediation}`);
    }
  }
  const suggestions = Array.isArray(value.details?.suggestions)
    ? value.details.suggestions.filter(
        (suggestion): suggestion is string => typeof suggestion === "string",
      )
    : [];
  if (suggestions.length > 0) lines.push(`Suggestions: ${suggestions.join(", ")}`);
  const ownerPid = value.details?.pid;
  const ownerAcquiredAt = value.details?.acquiredAt;
  if (
    typeof ownerPid === "number" &&
    Number.isSafeInteger(ownerPid) &&
    typeof ownerAcquiredAt === "string"
  ) {
    lines.push(`Owner: PID ${ownerPid}, acquired at ${ownerAcquiredAt}`);
  }
  if (typeof value.remediation === "string") {
    lines.push(`Next: ${value.remediation}`);
  } else if (typeof value.details?.remediation === "string") {
    lines.push(`Next: ${value.details.remediation}`);
  }
  return sanitizeTerminal(lines.join("\n"));
}

export function fail(error: unknown, json = false, exitCode = 1): never {
  const base =
    error instanceof Error
      ? {
          schema_version: 1,
          error: error.name,
          message: error.message,
          ...("code" in error ? { code: error.code } : {}),
          ...(error instanceof AwfError && Object.keys(error.details).length > 0
            ? { details: error.details }
            : {}),
        }
      : { schema_version: 1, error: "UnknownError", message: String(error) };
  const metadata = errorContractMetadata(base);
  if (json) process.stderr.write(`${JSON.stringify({ ...base, ...metadata })}\n`);
  else process.stderr.write(`${humanError({ ...base, remediation: metadata.remediation })}\n`);
  process.exitCode = exitCode;
  throw new Error("__AWF_HANDLED__");
}
