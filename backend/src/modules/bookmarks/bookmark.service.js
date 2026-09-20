import * as Bookmark from "./bookmark.model.js";
import { getPaginationData, parsePaginationParams } from "../../utils/pagination.js";

/**
 * Toggles a bookmark. Exactly one of postId / campaignId must be provided.
 * @param {number} userId
 * @param {{ postId?: string|number, campaignId?: string|number }} body
 */
export const toggleBookmark = async (userId, body) => {
  const postId = body.postId ? parseInt(body.postId, 10) : null;
  const campaignId = body.campaignId ? parseInt(body.campaignId, 10) : null;

  if ((postId && campaignId) || (!postId && !campaignId)) {
    return {
      success: false,
      status: 400,
      message: "Provide exactly one of postId or campaignId",
    };
  }

  const result = await Bookmark.toggleBookmark(userId, { postId, campaignId });
  return { success: true, status: 200, data: result };
};

/**
 * Returns paginated bookmarks for the current user.
 * @param {number} userId
 * @param {string|number} queryPage
 * @param {string|number} queryLimit
 */
export const getBookmarks = async (userId, queryPage, queryLimit) => {
  const { page, limit } = parsePaginationParams(queryPage, queryLimit);
  if (page < 1 || limit < 1) {
    return { success: false, status: 400, message: "Invalid pagination parameters" };
  }

  const offset = (page - 1) * limit;
  const { items, total } = await Bookmark.findByUserId(userId, limit, offset);

  return {
    success: true,
    status: 200,
    data: {
      items,
      pagination: getPaginationData(total, page, limit),
    },
  };
};
