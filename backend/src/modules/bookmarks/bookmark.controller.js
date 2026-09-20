import * as bookmarkService from "./bookmark.service.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const toggleBookmark = asyncHandler(async (req, res) => {
  const result = await bookmarkService.toggleBookmark(req.user.id, req.body);
  if (!result.success) {
    return res.status(result.status).json({ success: false, message: result.message });
  }
  return res.status(result.status).json({ success: true, data: result.data });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const result = await bookmarkService.getBookmarks(
    req.user.id,
    req.query.page,
    req.query.limit,
  );
  if (!result.success) {
    return res.status(result.status).json({ success: false, message: result.message });
  }
  return res.status(result.status).json({ success: true, data: result.data });
});
