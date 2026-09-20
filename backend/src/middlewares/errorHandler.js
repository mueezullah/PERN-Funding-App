export const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging in console / CloudWatch
  console.error(err.stack || err);

  // If headers are already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Extract status code and normalize the message
  const statusCode = err.statusCode || (err.status && typeof err.status === "number" ? err.status : 500);
  const message = typeof err === "string" ? err : err.message || "Internal Server Error";

  // Send the structured JSON response
  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    // Only expose stack traces in development environments
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
