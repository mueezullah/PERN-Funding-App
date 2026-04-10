const getPaginationData = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

const parsePaginationParams = (queryPage: string | undefined | null, queryLimit: string | undefined | null) => {
  const page = parseInt(queryPage as string, 10) || 1;
  const limit = parseInt(queryLimit as string, 10) || 10;
  return { page, limit };
};

module.exports = { getPaginationData, parsePaginationParams };
