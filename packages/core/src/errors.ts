export type AwfErrorCode =
  | "INVALID_RECIPE"
  | "INVALID_PATH"
  | "FILE_TOO_LARGE"
  | "MISSING_FILE"
  | "CONFLICT"
  | "MODIFIED_FILE"
  | "NOT_FOUND"
  | "INVALID_MANIFEST";

export class AwfError extends Error {
  public constructor(
    public readonly code: AwfErrorCode,
    message: string,
    public readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "AwfError";
  }
}
