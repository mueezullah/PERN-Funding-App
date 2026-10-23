import prisma from "../../config/prisma.js";
import { getPresignedGetUrl, sanitizeMediaUrl } from "../../utils/s3.service.js";

export const create = async (
  userId,
  title,
  description,
  goalAmount,
  deadline,
  mediaUrl,
) => {
  return await prisma.campaign.create({
    data: {
      user_id: parseInt(userId, 10),
      title,
      description,
      goal_amount: goalAmount,
      deadline: new Date(deadline),
      media_url: sanitizeMediaUrl(mediaUrl),
    },
  });
};

export const findAllActive = async (limit, offset, status = "active") => {
  const whereCondition =
    status && status !== "all"
      ? { status }
      : { status: { not: "deleted" } };

  const [campaignsList, totalCount] = await Promise.all([
    prisma.campaign.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.campaign.count({ where: whereCondition }),
  ]);

  // Transform campaigns to include comments_count, likes_count, owner_name, owner_username, owner_avatar, and presigned media_url
  const formattedCampaigns = await Promise.all(
    campaignsList.map(async (c) => {
      const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
        prisma.comment.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
        prisma.like.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
        getPresignedGetUrl(c.media_url),
        getPresignedGetUrl(c.user?.avatar_url),
      ]);

      return {
        ...c,
        media_url: presignedMediaUrl,
        owner_name: c.user?.name,
        owner_username: c.user?.username,
        owner_avatar: presignedAvatarUrl,
        user: c.user ? { ...c.user, avatar_url: presignedAvatarUrl } : null,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    campaigns: formattedCampaigns,
    total: totalCount,
  };
};

export const findByUserId = async (userId, limit = 10, offset = 0) => {
  const whereCondition = {
    user_id: parseInt(userId, 10),
    status: { not: "deleted" },
  };

  const [campaignsList, totalCount] = await Promise.all([
    prisma.campaign.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
      },
      orderBy: [{ pinned_at: { sort: "desc", nulls: "last" } }, { created_at: "desc" }],
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.campaign.count({ where: whereCondition }),
  ]);

  const formattedCampaigns = await Promise.all(
    campaignsList.map(async (c) => {
      const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
        prisma.comment.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
        prisma.like.count({
          where: { target_type: "campaign", target_id: c.id },
        }),
        getPresignedGetUrl(c.media_url),
        getPresignedGetUrl(c.user?.avatar_url),
      ]);

      return {
        ...c,
        media_url: presignedMediaUrl,
        owner_name: c.user?.name,
        owner_username: c.user?.username,
        owner_avatar: presignedAvatarUrl,
        user: c.user ? { ...c.user, avatar_url: presignedAvatarUrl } : null,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    campaigns: formattedCampaigns,
    total: totalCount,
  };
};

export const findById = async (id) => {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: parseInt(id, 10),
      status: { not: "deleted" },
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, email: true, avatar_url: true },
      },
    },
  });

  if (!campaign) return null;

  const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
    prisma.comment.count({
      where: { target_type: "campaign", target_id: campaign.id },
    }),
    prisma.like.count({
      where: { target_type: "campaign", target_id: campaign.id },
    }),
    getPresignedGetUrl(campaign.media_url),
    getPresignedGetUrl(campaign.user?.avatar_url),
  ]);

  return {
    ...campaign,
    media_url: presignedMediaUrl,
    owner_name: campaign.user?.name,
    owner_username: campaign.user?.username,
    owner_email: campaign.user?.email,
    owner_avatar: presignedAvatarUrl,
    user: campaign.user ? { ...campaign.user, avatar_url: presignedAvatarUrl } : null,
    comments_count: commentsCount,
    likes_count: likesCount,
  };
};

export const update = async (
  id,
  title,
  description,
  goalAmount,
  deadline,
  mediaUrl,
) => {
  const updateData = {
    status: "updated",
  };
  if (title !== undefined && title !== null) updateData.title = title;
  if (description !== undefined && description !== null) updateData.description = description;
  if (goalAmount !== undefined && goalAmount !== null) updateData.goal_amount = goalAmount;
  if (deadline !== undefined && deadline !== null) updateData.deadline = new Date(deadline);
  if (mediaUrl !== undefined && mediaUrl !== null) updateData.media_url = sanitizeMediaUrl(mediaUrl);

  return await prisma.campaign.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
  });
};

export const updateExpiredCampaigns = async () => {
  const expiredCampaigns = await prisma.campaign.findMany({
    where: {
      status: "active",
      deadline: { lt: new Date() },
    },
  });

  await prisma.campaign.updateMany({
    where: {
      status: "active",
      deadline: { lt: new Date() },
    },
    data: {
      status: "ended",
    },
  });

  return expiredCampaigns;
};

export const deleteCampaign = async (id) => {
  return await prisma.campaign.update({
    where: { id: parseInt(id, 10) },
    data: {
      status: "deleted",
      current_amount: 0,
    },
  });
};

/**
 * Toggles the pinned state of a campaign. Sets pinned_at to now if null, clears if set.
 * Only the owner can pin/unpin.
 * @param {number} id
 * @param {number} userId
 * @returns {{ pinned: boolean, pinned_at: Date|null }}
 */
export const togglePin = async (id, userId) => {
  const campaign = await prisma.campaign.findFirst({
    where: { id: parseInt(id, 10), user_id: parseInt(userId, 10) },
    select: { id: true, pinned_at: true },
  });

  if (!campaign) return null;

  const newPinnedAt = campaign.pinned_at ? null : new Date();
  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { pinned_at: newPinnedAt },
    select: { id: true, pinned_at: true },
  });

  return { pinned: !updated.pinned_at ? false : true, pinned_at: updated.pinned_at };
};

