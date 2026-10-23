import * as exploreService from "./explore.service.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const getExploreFeed = asyncHandler(async (req, res) => {
  const result = await exploreService.getExploreFeed(req.query.page, req.query.limit);
  if (!result.success) {
    return res.status(result.status).json({ success: false, message: result.message });
  }
  return res.status(result.status).json({ success: true, data: result.data });
});
