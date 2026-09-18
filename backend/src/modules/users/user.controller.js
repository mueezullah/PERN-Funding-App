import * as userService from "./user.service.js";
import { uploadToS3, getPresignedGetUrl } from "../../utils/s3.service.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const profile = await userService.getUserProfileStats(username);
  if (!profile) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.status(200).json({ success: true, data: profile });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let avatarUrl = req.body.avatar_url;

  if (req.file) {
    avatarUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "avatars"
    );
  }

  if (!avatarUrl) {
    return res.status(400).json({
      success: false,
      message: "No avatar image file or URL provided",
    });
  }

  const updatedUser = await userService.updateUserAvatar(userId, avatarUrl);
  const presignedAvatar = (await getPresignedGetUrl(updatedUser.avatar_url)) || avatarUrl;

  return res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    avatar_url: presignedAvatar,
    avatar: presignedAvatar,
    user: {
      ...updatedUser,
      avatar_url: presignedAvatar,
      avatar: presignedAvatar,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, username } = req.body;
  let avatarUrl = req.body.avatar_url;

  if (req.file) {
    avatarUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "avatars"
    );
  }

  const result = await userService.updateUserProfile(userId, {
    name,
    username,
    avatarUrl,
  });

  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      message: result.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: result.data,
  });
});

/**
 * GET /api/users/me/donations
 * Returns paginated donation history for the currently authenticated user.
 */
export const getMyDonations = asyncHandler(async (req, res) => {
  const result = await userService.getMyDonations(
    req.user.id,
    req.query.page,
    req.query.limit,
  );
  if (!result.success) {
    return res.status(result.status).json({ success: false, message: result.message });
  }
  return res.status(result.status).json({ success: true, data: result.data });
});

/**
 * GET /api/users/me/campaigns
 * Returns paginated campaigns created by the currently authenticated user.
 */
export const getMyCampaigns = asyncHandler(async (req, res) => {
  const result = await userService.getMyCampaigns(
    req.user.id,
    req.query.page,
    req.query.limit,
  );
  if (!result.success) {
    return res.status(result.status).json({ success: false, message: result.message });
  }
  return res.status(result.status).json({ success: true, data: result.data });
});
