import { constants, type Stats } from "node:fs";
import { type FileHandle, lstat, open } from "node:fs/promises";
import path from "node:path";
import { AwfError } from "./errors.js";

export const MAX_RECIPE_FILE_BYTES = 1024 * 1024;
// biome-ignore lint/complexity/useRegexLiterals: Constructors keep control bytes out of source literals.
const ansiEscapePattern = new RegExp(
  "(?:\\x1B\\[[0-?]*[ -/]*[@-~]|\\x9B[0-?]*[ -/]*[@-~]|\\x1B\\][^\\x07\\x1B]*(?:\\x07|\\x1B\\\\)|\\x1B[P^_][\\s\\S]*?\\x1B\\\\)",
  "g",
);
// biome-ignore lint/complexity/useRegexLiterals: Constructors keep control bytes out of source literals.
const unsafeControlPattern = new RegExp("[\\x00-\\x08\\x0B-\\x1F\\x7F-\\x9F]", "g");
const bidiControlPattern = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

export function sanitizeTerminal(value: string): string {
  return value
    .replace(ansiEscapePattern, "")
    .replace(unsafeControlPattern, "")
    .replace(bidiControlPattern, "");
}

export function resolveInside(root: string, candidate: string): string {
  if (path.isAbsolute(candidate)) {
    throw new AwfError("INVALID_PATH", "Absolute paths are not allowed.", { candidate });
  }
  const absoluteRoot = path.resolve(root);
  const resolved = path.resolve(absoluteRoot, candidate);
  if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new AwfError("INVALID_PATH", "Path escapes the allowed target.", { candidate });
  }
  return resolved;
}

export async function assertNoSymlink(root: string, destination: string): Promise<void> {
  const absoluteRoot = path.resolve(root);
  let current = path.resolve(destination);
  while (current === absoluteRoot || current.startsWith(`${absoluteRoot}${path.sep}`)) {
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink()) {
        throw new AwfError("INVALID_PATH", "A destination parent is a symbolic link.", { current });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    current = path.dirname(current);
  }
}

function sameFileIdentity(expected: Stats, actual: Stats): boolean {
  return (
    (expected.ino === 0 ||
      actual.ino === 0 ||
      (expected.dev === actual.dev && expected.ino === actual.ino)) &&
    expected.size === actual.size &&
    expected.mtimeMs === actual.mtimeMs
  );
}

export async function readBoundedRegularFile(
  candidate: string,
  maxBytes: number,
  root?: string,
): Promise<Buffer> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new AwfError("FILE_TOO_LARGE", "The file byte limit must be a positive integer.");
  }
  const file = path.resolve(candidate);
  if (root) {
    const absoluteRoot = path.resolve(root);
    const relative = path.relative(absoluteRoot, file);
    resolveInside(absoluteRoot, relative);
    await assertNoSymlink(absoluteRoot, file);
  }

  let before: Stats;
  try {
    before = await lstat(file);
  } catch (error) {
    throw new AwfError("MISSING_FILE", "Cannot inspect a required file.", {
      path: file,
      causeCode: (error as NodeJS.ErrnoException).code,
    });
  }
  if (before.isSymbolicLink() || !before.isFile()) {
    throw new AwfError("INVALID_PATH", "Expected a regular file without symbolic links.", {
      path: file,
    });
  }
  if (before.size > maxBytes) {
    throw new AwfError("FILE_TOO_LARGE", "File exceeds the configured byte limit.", {
      path: file,
      limit: maxBytes,
      actual: before.size,
    });
  }

  const noFollow = process.platform === "win32" ? 0 : constants.O_NOFOLLOW;
  let handle: FileHandle;
  try {
    handle = await open(file, constants.O_RDONLY | noFollow);
  } catch (error) {
    throw new AwfError("INVALID_PATH", "Cannot safely open a required file.", {
      path: file,
      causeCode: (error as NodeJS.ErrnoException).code,
    });
  }

  try {
    const opened = await handle.stat();
    if (!opened.isFile() || !sameFileIdentity(before, opened)) {
      throw new AwfError("INVALID_PATH", "File changed while it was being opened.", { path: file });
    }
    const chunks: Buffer[] = [];
    let total = 0;
    while (total <= maxBytes) {
      const buffer = Buffer.allocUnsafe(Math.min(64 * 1024, maxBytes + 1 - total));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, total);
      if (bytesRead === 0) break;
      chunks.push(buffer.subarray(0, bytesRead));
      total += bytesRead;
    }
    if (total > maxBytes) {
      throw new AwfError("FILE_TOO_LARGE", "File exceeds the configured byte limit.", {
        path: file,
        limit: maxBytes,
        actual: total,
      });
    }
    const after = await handle.stat();
    if (total !== opened.size || !sameFileIdentity(opened, after)) {
      throw new AwfError("INVALID_PATH", "File changed while it was being read.", { path: file });
    }
    return Buffer.concat(chunks, total);
  } finally {
    await handle.close();
  }
}
