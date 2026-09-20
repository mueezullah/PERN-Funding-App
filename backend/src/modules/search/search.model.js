import prisma from "../../config/prisma.js";
import { getPresignedGetUrl } from "../../utils/s3.service.js";

/**
 * Searches across users, campaigns, and posts using case-insensitive partial matching.
 *
 * @param {string} query
 * @param {string} type - 'all' | 'users' | 'campaigns' | 'posts'
 * @param {number} limit
 */
export const searchGlobal = async (query, type = "all", limit = 5) => {
  const cleanQuery = query.trim();
  const lim = parseInt(limit, 10) || 5;

  let users = [];
  let campaigns = [];
  let posts = [];

  const shouldFetchUsers = type === "all" || type === "users";
  const shouldFetchCampaigns = type === "all" || type === "campaigns";
  const shouldFetchPosts = type === "all" || type === "posts";

  const promises = [];

  if (shouldFetchUsers) {
    promises.push(
      prisma.user
        .findMany({
          where: {
            OR: [
              { username: { contains: cleanQuery, mode: "insensitive" } },
              { name: { contains: cleanQuery, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            role: true,
            kyc_verified: true,
          },
          take: lim,
        })
        .then(async (userList) => {
          users = await Promise.all(
            userList.map(async (u) => ({
              ...u,
              avatar_url: await getPresignedGetUrl(u.avatar_url),
            }))
          );
        })
    );
  }

  if (shouldFetchCampaigns) {
    promises.push(
      prisma.campaign
        .findMany({
          where: {
            status: { not: "deleted" },
            OR: [
              { title: { contains: cleanQuery, mode: "insensitive" } },
              { description: { contains: cleanQuery, mode: "insensitive" } },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
          take: lim,
        })
        .then(async (campaignList) => {
          campaigns = await Promise.all(
            campaignList.map(async (c) => {
              const [userAvatar, mediaUrl] = await Promise.all([
                getPresignedGetUrl(c.user?.avatar_url),
                getPresignedGetUrl(c.media_url),
              ]);
              return {
                ...c,
                media_url: mediaUrl,
                user: c.user
                  ? { ...c.user, avatar_url: userAvatar }
                  : null,
              };
            })
          );
        })
    );
  }

  if (shouldFetchPosts) {
    promises.push(
      prisma.post
        .findMany({
          where: {
            status: { not: "deleted" },
            content: { contains: cleanQuery, mode: "insensitive" },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
                role: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
          take: lim,
        })
        .then(async (postList) => {
          posts = await Promise.all(
            postList.map(async (p) => {
              const [commentsCount, likesCount, mediaUrl, userAvatar] =
                await Promise.all([
                  prisma.comment.count({
                    where: { target_type: "post", target_id: p.id },
                  }),
                  prisma.like.count({
                    where: { target_type: "post", target_id: p.id },
                  }),
                  getPresignedGetUrl(p.media_url),
                  getPresignedGetUrl(p.user?.avatar_url),
                ]);

              return {
                ...p,
                media_url: mediaUrl,
                comments_count: commentsCount,
                likes_count: likesCount,
                user: p.user
                  ? { ...p.user, avatar_url: userAvatar }
                  : null,
              };
            })
          );
        })
    );
  }

  await Promise.all(promises);

  return {
    users,
    campaigns,
    posts,
    totalCount: users.length + campaigns.length + posts.length,
  };
};
