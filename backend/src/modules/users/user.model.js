import prisma from "../../config/prisma.js";
import { sanitizeMediaUrl } from "../../utils/s3.service.js";

// User Model operations using Prisma Client

export const create = async (name, username, email, password) => {
  return await prisma.user.create({
    data: {
      name,
      username,
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      avatar_url: true,
      kyc_verified: true,
      created_at: true,
    },
  });
};

export const findByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const getPostCountByUserId = async (userId) => {
  return await prisma.post.count({
    where: {
      user_id: parseInt(userId, 10),
      status: "active",
    },
  });
};

export const getCampaignCountByUserId = async (userId) => {
  return await prisma.campaign.count({
    where: {
      user_id: parseInt(userId, 10),
    },
  });
};

export const getBackedProjectsCountByUserId = async (userId) => {
  const result = await prisma.donation.groupBy({
    by: ["campaign_id"],
    where: {
      donor_id: parseInt(userId, 10),
      status: "completed",
    },
  });
  return result.length;
};

export const getTotalContributedByUserId = async (userId) => {
  const aggregate = await prisma.donation.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      donor_id: parseInt(userId, 10),
      status: "completed",
    },
  });
  return aggregate._sum.amount ? Number(aggregate._sum.amount) : 0;
};

export const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      avatar_url: true,
      kyc_verified: true,
      created_at: true,
    },
  });
};

export const findAll = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      avatar_url: true,
      kyc_verified: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

export const update = async (
  id,
  {
    name = null,
    username = null,
    email = null,
    role = null,
    avatar_url = null,
    kyc_verified = null,
  } = {},
) => {
  const updateData = {};
  if (name !== null) updateData.name = name;
  if (username !== null) updateData.username = username;
  if (email !== null) updateData.email = email;
  if (role !== null) updateData.role = role;
  if (avatar_url !== null) updateData.avatar_url = sanitizeMediaUrl(avatar_url);
  if (kyc_verified !== null) updateData.kyc_verified = kyc_verified;

  return await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      avatar_url: true,
      kyc_verified: true,
      created_at: true,
    },
  });
};

export const updatePassword = async (id, newPassword) => {
  await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: { password: newPassword },
  });
  return true;
};

export const deleteUserRecord = async (id) => {
  return await prisma.user.delete({
    where: { id: parseInt(id, 10) },
    select: { id: true },
  });
};

/**
 * Returns paginated donation history for a user, joined with campaign data.
 * @param {number} userId
 * @param {number} limit
 * @param {number} offset
 */
export const getDonationsByUserId = async (userId, limit = 10, offset = 0) => {
  const uId = parseInt(userId, 10);

  const [donationsList, total] = await Promise.all([
    prisma.donation.findMany({
      where: {
        donor_id: uId,
        status: { not: "pending" }, // exclude unconfirmed
      },
      include: {
        campaign: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.donation.count({
      where: {
        donor_id: uId,
        status: { not: "pending" },
      },
    }),
  ]);

  const items = donationsList.map((d) => ({
    id: d.id,
    amount: Number(d.amount),
    status: d.status,
    created_at: d.created_at,
    campaign_id: d.campaign_id,
    campaign_title: d.campaign?.title ?? "Unknown Campaign",
    campaign_status: d.campaign?.status ?? null,
  }));

  return { items, total };
};

/**
 * Returns paginated campaigns created by a user (not donated to).
 * @param {number} userId
 * @param {number} limit
 * @param {number} offset
 */
export const getMyCampaignsByUserId = async (userId, limit = 10, offset = 0) => {
  const uId = parseInt(userId, 10);

  const [campaignsList, total] = await Promise.all([
    prisma.campaign.findMany({
      where: {
        user_id: uId,
        status: { not: "deleted" },
      },
      orderBy: [{ pinned_at: { sort: "desc", nulls: "last" } }, { created_at: "desc" }],
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.campaign.count({
      where: { user_id: uId, status: { not: "deleted" } },
    }),
  ]);

  return { campaigns: campaignsList, total };
};
