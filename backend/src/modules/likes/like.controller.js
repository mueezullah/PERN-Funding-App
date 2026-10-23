import * as Like from "./like.model.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const toggleLike = asyncHandler(async (req, res) => {
  const targetType = req.body.targetType || req.body.target_type;
  const targetId = req.body.targetId || req.body.target_id;
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required"
    });
  }

  if (!targetType || targetId === undefined || targetId === null) {
    return res.status(400).json({
      success: false,
      message: "targetType and targetId are required"
    });
  }

  if (targetType !== "campaign" && targetType !== "post") {
    return res.status(400).json({
      success: false,
      message: "targetType must be either 'campaign' or 'post'"
    });
  }

  const rawTargetId = typeof targetId === "string" ? targetId.replace(/\D/g, "") : targetId;
  const numericTargetId = parseInt(rawTargetId, 10);
  if (isNaN(numericTargetId)) {
    return res.status(400).json({
      success: false,
      message: "targetId must be an integer"
    });
  }

  const result = await Like.toggle(userId, targetType, numericTargetId);
  const likesCount = await Like.countByTarget(targetType, numericTargetId);

  res.status(200).json({
    success: true,
    data: {
      liked: result.liked,
      likesCount
    }
  });
});

export const getLikeStatus = asyncHandler(async (req, res) => {
  const targetType = req.query.targetType || req.query.target_type;
  const targetId = req.query.targetId || req.query.target_id;
  const userId = req.user?.id || req.user?.userId;

  if (!targetType || targetId === undefined || targetId === null) {
    return res.status(400).json({
      success: false,
      message: "targetType and targetId query parameters are required"
    });
  }

  const rawTargetId = typeof targetId === "string" ? targetId.replace(/\D/g, "") : targetId;
  const numericTargetId = parseInt(rawTargetId, 10);
  if (isNaN(numericTargetId)) {
    return res.status(400).json({
      success: false,
      message: "targetId must be an integer"
    });
  }

  const likesCount = await Like.countByTarget(targetType, numericTargetId);
  const liked = userId ? await Like.hasUserLiked(userId, targetType, numericTargetId) : false;

  res.status(200).json({
    success: true,
    data: {
      liked,
      likesCount
    }
  });
});
