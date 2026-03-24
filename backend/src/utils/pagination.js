const getPaginationData = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

const parsePaginationParams = (queryPage, queryLimit) => {
  const page = parseInt(queryPage, 10) || 1;
  const limit = parseInt(queryLimit, 10) || 10;
  return { page, limit };
};

module.exports = { getPaginationData, parsePaginationParams };
