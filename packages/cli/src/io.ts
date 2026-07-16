import { AwfError, sanitizeTerminal } from "@agentic-workflows/core";

export function output(value: unknown, json = false): void {
  if (json) process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else process.stdout.write(`${sanitizeTerminal(String(value))}\n`);
}

export function fail(error: unknown, json = false, exitCode = 1): never {
  const value =
    error instanceof Error
      ? {
          error: error.name,
          message: error.message,
          ...("code" in error ? { code: error.code } : {}),
          ...(error instanceof AwfError && Object.keys(error.details).length > 0
            ? { details: error.details }
            : {}),
        }
      : { error: "UnknownError", message: String(error) };
  if (json) process.stderr.write(`${JSON.stringify(value)}\n`);
  else process.stderr.write(`Error: ${sanitizeTerminal(value.message)}\n`);
  process.exitCode = exitCode;
  throw new Error("__AWF_HANDLED__");
}
