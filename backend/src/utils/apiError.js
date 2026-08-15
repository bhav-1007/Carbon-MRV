export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFound(message = "Resource not found") {
  return new ApiError(404, "NOT_FOUND", message);
}
