import prisma from "../../config/prisma.js";
import { getPresignedGetUrl } from "../../utils/s3.service.js";

/**
 * Returns a combined, sorted-by-recency page of posts and campaigns for the Explore feed.
 * Uses the same formatting as findAllPosts / findAllActive to stay consistent.
 *
 * @param {number} limit
 * @param {number} offset
 */
export const getExploreFeed = async (limit = 10, offset = 0) => {
  const lim = parseInt(limit, 10);
  const off = parseInt(offset, 10);

  // Fetch posts and campaigns concurrently; fetch a bit more than needed per
  // entity so the merged sort still delivers the correct page after interleaving.
  const fetchSize = lim + off;

  const [postsList, campaignsList] = await Promise.all([
    prisma.post.findMany({
      where: { status: { not: "deleted" } },
      include: { user: { select: { id: true, name: true, username: true, role: true, avatar_url: true } } },
      orderBy: { created_at: "desc" },
      take: fetchSize,
    }),
    prisma.campaign.findMany({
      where: { status: { not: "deleted" } },
      include: { user: { select: { id: true, name: true, username: true, avatar_url: true } } },
      orderBy: { created_at: "desc" },
      take: fetchSize,
    }),
  ]);

  // Enrich both lists with counts and presigned URLs concurrently
  const [enrichedPosts, enrichedCampaigns] = await Promise.all([
    Promise.all(
      postsList.map(async (p) => {
        const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
          prisma.comment.count({ where: { target_type: "post", target_id: p.id } }),
          prisma.like.count({ where: { target_type: "post", target_id: p.id } }),
          getPresignedGetUrl(p.media_url),
          getPresignedGetUrl(p.user?.avatar_url),
        ]);
        return {
          ...p,
          type: "post",
          media_url: presignedMediaUrl,
          author_name: p.user?.name,
          author_username: p.user?.username,
          author_role: p.user?.role,
          author_avatar: presignedAvatarUrl,
          user: p.user ? { ...p.user, avatar_url: presignedAvatarUrl } : null,
          comments_count: commentsCount,
          likes_count: likesCount,
        };
      })
    ),
    Promise.all(
      campaignsList.map(async (c) => {
        const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
          prisma.comment.count({ where: { target_type: "campaign", target_id: c.id } }),
          prisma.like.count({ where: { target_type: "campaign", target_id: c.id } }),
          getPresignedGetUrl(c.media_url),
          getPresignedGetUrl(c.user?.avatar_url),
        ]);
        return {
          ...c,
          type: "campaign",
          media_url: presignedMediaUrl,
          owner_name: c.user?.name,
          owner_username: c.user?.username,
          owner_avatar: presignedAvatarUrl,
          user: c.user ? { ...c.user, avatar_url: presignedAvatarUrl } : null,
          comments_count: commentsCount,
          likes_count: likesCount,
        };
      })
    ),
  ]);

  // Merge and sort by created_at descending — same ranking as the main feed
  const combined = [...enrichedPosts, ...enrichedCampaigns].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply pagination manually after merge-sort
  const total = combined.length; // approximate total for pagination UI
  const page = combined.slice(off, off + lim);

  return { items: page, total };
};
