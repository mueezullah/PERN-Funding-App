import Joi from "joi";

// POST /kyc/start — no body needed; user identity comes from the JWT
export const startSessionSchema = Joi.object({});

// PATCH /admin/kyc/:id — admin sets their decision
export const adminDecisionSchema = Joi.object({
  adminStatus: Joi.string().valid("approved", "rejected").required().messages({
    "any.only": "adminStatus must be 'approved' or 'rejected'",
    "any.required": "adminStatus is required",
  }),
});
