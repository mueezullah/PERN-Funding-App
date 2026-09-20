/**
 * Standard Application Error class with HTTP status codes.
 * Works seamlessly with Express centralized errorHandler.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500, etc.)
   * @param {string} message - Error description message
   * @param {any} [details=null] - Additional validation or error details
   */
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized", details = null) {
    return new ApiError(401, message, details);
  }

  static forbidden(message = "Forbidden", details = null) {
    return new ApiError(403, message, details);
  }

  static notFound(message = "Resource Not Found", details = null) {
    return new ApiError(404, message, details);
  }

  static conflict(message = "Conflict", details = null) {
    return new ApiError(409, message, details);
  }

  static internal(message = "Internal Server Error", details = null) {
    return new ApiError(500, message, details);
  }
}

export default ApiError;
