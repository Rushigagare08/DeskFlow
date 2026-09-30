import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log full error on server in non-test environments for debugging
  if (process.env.NODE_ENV !== "test") {
    console.error("[ErrorHandler]", err);
  }

  // 1. Custom AppError
  if (err instanceof AppError) {
    const responseBody: Record<string, any> = { error: err.message };
    if (err.details) {
      responseBody.details = err.details;
    }
    res.status(err.statusCode).json(responseBody);
    return;
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // 3. Express JSON Parse Error
  if (err instanceof SyntaxError && "status" in err && (err as any).status === 400) {
    res.status(400).json({ error: "Invalid JSON format in request body." });
    return;
  }

  // 4. SQLite Constraint / UNIQUE Violations
  if (
    err.code === "SQLITE_CONSTRAINT" ||
    err.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    (typeof err.message === "string" && err.message.includes("UNIQUE constraint failed"))
  ) {
    res.status(409).json({ error: "Resource conflict: duplicate entry already exists." });
    return;
  }

  // 5. Default 500 Internal Server Error (Sanitized response)
  res.status(500).json({ error: "An unexpected server error occurred." });
}
