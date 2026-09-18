import * as UserModel from "./user.model.js";
import { getPresignedGetUrl } from "../../utils/s3.service.js";
import { getPaginationData, parsePaginationParams } from "../../utils/pagination.js";

export const getUserProfileStats = async (username) => {
  const user = await UserModel.findByUsername(username);
  if (!user) {
    return null;
  }

  const [posts, campaigns, backedProjects, totalContributed, presignedAvatarUrl] =
    await Promise.all([
      UserModel.getPostCountByUserId(user.id),
      UserModel.getCampaignCountByUserId(user.id),
      UserModel.getBackedProjectsCountByUserId(user.id),
      UserModel.getTotalContributedByUserId(user.id),
      getPresignedGetUrl(user.avatar_url),
    ]);

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    avatarUrl: presignedAvatarUrl,
    avatar_url: presignedAvatarUrl,
    avatar: presignedAvatarUrl,
    createdAt: user.created_at,
    posts,
    campaigns,
    backedProjects,
    totalContributed,
  };
};

export const updateUserAvatar = async (userId, avatarUrl) => {
  const updatedUser = await UserModel.update(userId, { avatar_url: avatarUrl });
  return updatedUser;
};

export const updateUserProfile = async (userId, { name, username, avatarUrl }) => {
  const current = await UserModel.findById(userId);
  if (!current) {
    return { success: false, status: 404, message: "User not found" };
  }

  const cleanUsername = username ? username.trim().toLowerCase() : null;
  if (cleanUsername && cleanUsername !== current.username.toLowerCase()) {
    // Validate username format (letters, numbers, underscore, 3-20 chars)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      return {
        success: false,
        status: 400,
        message: "Username must be 3-20 alphanumeric characters or underscores",
      };
    }

    const existing = await UserModel.findByUsername(cleanUsername);
    if (existing && existing.id !== current.id) {
      return { success: false, status: 409, message: "Username is already taken" };
    }
  }

  const updatePayload = {};
  if (name !== undefined && name !== null && name.trim()) {
    updatePayload.name = name.trim();
  }
  if (cleanUsername) {
    updatePayload.username = cleanUsername;
  }
  if (avatarUrl !== undefined && avatarUrl !== null) {
    updatePayload.avatar_url = avatarUrl;
  }

  const updatedUser = await UserModel.update(userId, updatePayload);
  const presignedAvatar = (await getPresignedGetUrl(updatedUser.avatar_url)) || updatedUser.avatar_url;

  return {
    success: true,
    status: 200,
    data: {
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        avatar_url: presignedAvatar,
        avatar: presignedAvatar,
      },
    },
  };
};

/**
 * Returns paginated donation history for the currently authenticated user.
 * @param {number} userId
 * @param {string|number} queryPage
 * @param {string|number} queryLimit
 */
export const getMyDonations = async (userId, queryPage, queryLimit) => {
  const { page, limit } = parsePaginationParams(queryPage, queryLimit);
  if (page < 1 || limit < 1) {
    return { success: false, status: 400, message: "Invalid pagination parameters" };
  }

  const offset = (page - 1) * limit;
  const { items, total } = await UserModel.getDonationsByUserId(userId, limit, offset);

  return {
    success: true,
    status: 200,
    data: {
      donations: items,
      pagination: getPaginationData(total, page, limit),
    },
  };
};

/**
 * Returns paginated campaigns created by the currently authenticated user.
 * @param {number} userId
 * @param {string|number} queryPage
 * @param {string|number} queryLimit
 */
export const getMyCampaigns = async (userId, queryPage, queryLimit) => {
  const { page, limit } = parsePaginationParams(queryPage, queryLimit);
  if (page < 1 || limit < 1) {
    return { success: false, status: 400, message: "Invalid pagination parameters" };
  }

  const offset = (page - 1) * limit;
  const { campaigns, total } = await UserModel.getMyCampaignsByUserId(userId, limit, offset);

  return {
    success: true,
    status: 200,
    data: {
      campaigns,
      pagination: getPaginationData(total, page, limit),
    },
  };
};
