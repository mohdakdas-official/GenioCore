import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import { searchPlatform } from "../services/search.service.js";

export const globalSearch = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const { q } = res.locals.validatedQuery;

  const results = await searchPlatform({
    ownerId,
    query: q,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, results, "Search completed successfully."));
});
