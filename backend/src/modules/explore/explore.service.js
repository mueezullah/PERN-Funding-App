import * as ExploreModel from "./explore.model.js";
import { getPaginationData, parsePaginationParams } from "../../utils/pagination.js";

export const getExploreFeed = async (queryPage, queryLimit) => {
  const { page, limit } = parsePaginationParams(queryPage, queryLimit);
  if (page < 1 || limit < 1) {
    return { success: false, status: 400, message: "Invalid pagination parameters" };
  }

  const offset = (page - 1) * limit;
  const { items, total } = await ExploreModel.getExploreFeed(limit, offset);

  return {
    success: true,
    status: 200,
    data: {
      items,
      pagination: getPaginationData(total, page, limit),
    },
  };
};
