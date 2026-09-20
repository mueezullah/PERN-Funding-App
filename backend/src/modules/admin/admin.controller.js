import * as adminService from "./admin.service.js";
import {
  getPendingKycRecords,
  processAdminDecision,
} from "../kyc/kyc.service.js";
import { adminDecisionSchema } from "../kyc/kyc.validation.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

// GET /admin/analytics
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getPlatformAnalytics();
  return res.status(200).json({
    success: true,
    data: analytics,
  });
});

// GET /admin/kyc/pending
export const listPendingKyc = asyncHandler(async (req, res) => {
  const result = await getPendingKycRecords();
  return res.status(result.status).json(result);
});

// PATCH /admin/kyc/:id
export const decideKyc = asyncHandler(async (req, res) => {
  // Validate body with Joi before touching the DB
  const { error, value } = adminDecisionSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  const result = await processAdminDecision(req.params.id, value.adminStatus);
  return res.status(result.status).json(
    result.success
      ? { success: true, ...result.data }
      : { success: false, message: result.message }
  );
});
