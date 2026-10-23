import * as FollowModel from "./follow.model.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const handleToggleFollow = asyncHandler(async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.targetUserId, 10);

  if (followerId === followingId) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  const result = await FollowModel.toggleFollow(followerId, followingId);
  const counts = await FollowModel.getFollowCounts(followingId);

  return res.status(200).json({
    success: true,
    isFollowing: result.isFollowing,
    ...counts,
  });
});

export const getFollowStatus = asyncHandler(async (req, res) => {
  const followerId = req.user?.id;
  const targetUserId = parseInt(req.params.targetUserId, 10);

  const counts = await FollowModel.getFollowCounts(targetUserId);
  const isFollowing = followerId
    ? await FollowModel.checkIsFollowing(followerId, targetUserId)
    : false;

  return res.status(200).json({
    success: true,
    isFollowing,
    ...counts,
  });
});

export const getFollowersList = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const followers = await FollowModel.getFollowers(userId);
  return res.status(200).json({ success: true, followers });
});

export const getFollowingList = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const following = await FollowModel.getFollowing(userId);
  return res.status(200).json({ success: true, following });
});
