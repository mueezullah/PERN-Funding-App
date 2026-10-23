import * as SearchModel from "./search.model.js";

export const searchGlobal = async (query, type = "all", limit = 5) => {
  if (!query || query.trim().length === 0) {
    return {
      success: true,
      status: 200,
      data: {
        users: [],
        campaigns: [],
        posts: [],
        totalCount: 0,
      },
    };
  }

  const results = await SearchModel.searchGlobal(query, type, limit);

  return {
    success: true,
    status: 200,
    data: results,
  };
};
