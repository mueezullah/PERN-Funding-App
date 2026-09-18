import prisma from "../../config/prisma.js";
import { getPresignedGetUrl } from "../../utils/s3.service.js";

/**
 * Toggles a bookmark on/off for a given user+target.
 * @param {number} userId
 * @param {{ postId?: number, campaignId?: number }} target
 * @returns {{ bookmarked: boolean }}
 */
export const toggleBookmark = async (userId, { postId, campaignId }) => {
  const uId = parseInt(userId, 10);

  if (postId) {
    const pId = parseInt(postId, 10);
    const existing = await prisma.bookmark.findUnique({
      where: { unique_bookmark_post: { user_id: uId, post_id: pId } },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await prisma.bookmark.create({ data: { user_id: uId, post_id: pId } });
    return { bookmarked: true };
  }

  // campaignId branch
  const cId = parseInt(campaignId, 10);
  const existing = await prisma.bookmark.findUnique({
    where: { unique_bookmark_campaign: { user_id: uId, campaign_id: cId } },
  });
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }
  await prisma.bookmark.create({ data: { user_id: uId, campaign_id: cId } });
  return { bookmarked: true };
};

/**
 * Returns paginated bookmarks for a user, including the joined post or campaign.
 * @param {number} userId
 * @param {number} limit
 * @param {number} offset
 */
export const findByUserId = async (userId, limit = 10, offset = 0) => {
  const uId = parseInt(userId, 10);

  const [bookmarksList, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { user_id: uId },
      include: {
        post: {
          include: { user: { select: { id: true, name: true, username: true, role: true, avatar_url: true } } },
        },
        campaign: {
          include: { user: { select: { id: true, name: true, username: true, avatar_url: true } } },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.bookmark.count({ where: { user_id: uId } }),
  ]);

  // Flatten each bookmark into a normalised item the frontend can render
  const items = await Promise.all(
    bookmarksList.map(async (bm) => {
      if (bm.post) {
        const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
          prisma.comment.count({ where: { target_type: "post", target_id: bm.post.id } }),
          prisma.like.count({ where: { target_type: "post", target_id: bm.post.id } }),
          getPresignedGetUrl(bm.post.media_url),
          getPresignedGetUrl(bm.post.user?.avatar_url),
        ]);
        return {
          bookmarkId: bm.id,
          bookmarkedAt: bm.created_at,
          type: "post",
          ...bm.post,
          media_url: presignedMediaUrl,
          author_name: bm.post.user?.name,
          author_username: bm.post.user?.username,
          author_role: bm.post.user?.role,
          author_avatar: presignedAvatarUrl,
          user: bm.post.user ? { ...bm.post.user, avatar_url: presignedAvatarUrl } : null,
          comments_count: commentsCount,
          likes_count: likesCount,
        };
      }

      // campaign
      const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
        prisma.comment.count({ where: { target_type: "campaign", target_id: bm.campaign.id } }),
        prisma.like.count({ where: { target_type: "campaign", target_id: bm.campaign.id } }),
        getPresignedGetUrl(bm.campaign.media_url),
        getPresignedGetUrl(bm.campaign.user?.avatar_url),
      ]);
      return {
        bookmarkId: bm.id,
        bookmarkedAt: bm.created_at,
        type: "campaign",
        ...bm.campaign,
        media_url: presignedMediaUrl,
        owner_name: bm.campaign.user?.name,
        owner_username: bm.campaign.user?.username,
        owner_avatar: presignedAvatarUrl,
        user: bm.campaign.user ? { ...bm.campaign.user, avatar_url: presignedAvatarUrl } : null,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return { items, total };
};
