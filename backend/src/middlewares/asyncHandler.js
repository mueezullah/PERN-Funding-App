/**
 * Higher-order function to wrap async Express middleware/route handlers.
 * Catches unhandled promise rejections and forwards them to next(err)
 * so they are processed by the centralized error handler.
 *
 * @param {Function} fn - Async express route handler (req, res, next)
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
