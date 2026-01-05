import { HttpStatus } from "../types/http.js";
import { ErrorCode } from "../types/error_codes.js";

export class AppError extends Error {
  public readonly status: HttpStatus;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(
    status: HttpStatus,
    code: ErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
