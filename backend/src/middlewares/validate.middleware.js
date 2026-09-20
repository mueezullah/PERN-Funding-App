/**
 * Generic reusable request validation middleware for Joi schemas.
 * 
 * @param {import("joi").Schema} schema - Joi validation schema
 * @param {"body"|"query"|"params"} [source="body"] - Request property to validate
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post("/campaigns", ensureAuthenticated, validate(createCampaignSchema), createCampaign);
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== "function") {
      return next();
    }

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessage = error.details
        ? error.details.map((detail) => detail.message).join(", ")
        : error.message;

      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: error.details,
      });
    }

    // Replace request payload with sanitized/casted values
    req[source] = value;
    next();
  };
};

export default validate;
