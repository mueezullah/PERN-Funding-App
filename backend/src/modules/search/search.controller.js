import * as searchService from "./search.service.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const searchGlobal = asyncHandler(async (req, res) => {
  const { q = "", type = "all", limit = 5 } = req.query;
  const result = await searchService.searchGlobal(q, type, limit);

  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(result.status).json({
    success: true,
    data: result.data,
  });
});
