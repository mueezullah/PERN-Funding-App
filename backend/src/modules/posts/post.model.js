import prisma from "../../config/prisma.js";
import { getPresignedGetUrl, sanitizeMediaUrl } from "../../utils/s3.service.js";

export const createPost = async (userId, content, mediaUrl) => {
  return await prisma.post.create({
    data: {
      user_id: parseInt(userId, 10),
      content,
      media_url: sanitizeMediaUrl(mediaUrl),
    },
  });
};

export const findAllPosts = async (limit = 10, offset = 0) => {
  const whereCondition = { status: { not: "deleted" } };

  const [postsList, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true, role: true, avatar_url: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.post.count({ where: whereCondition }),
  ]);

  const formattedPosts = await Promise.all(
    postsList.map(async (p) => {
      const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
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
        media_url: presignedMediaUrl,
        author_name: p.user?.name,
        author_username: p.user?.username,
        author_email: p.user?.email,
        author_role: p.user?.role,
        author_avatar: presignedAvatarUrl,
        user: p.user ? { ...p.user, avatar_url: presignedAvatarUrl } : null,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    posts: formattedPosts,
    total: totalCount,
  };
};

export const findByUserId = async (userId, limit = 10, offset = 0) => {
  const whereCondition = {
    user_id: parseInt(userId, 10),
    status: { not: "deleted" },
  };

  const [postsList, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true, role: true, avatar_url: true },
        },
      },
      // Pinned items first (pinned_at DESC nulls last), then chronological
      orderBy: [{ pinned_at: { sort: "desc", nulls: "last" } }, { created_at: "desc" }],
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    }),
    prisma.post.count({ where: whereCondition }),
  ]);

  const formattedPosts = await Promise.all(
    postsList.map(async (p) => {
      const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
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
        media_url: presignedMediaUrl,
        author_name: p.user?.name,
        author_username: p.user?.username,
        author_email: p.user?.email,
        author_role: p.user?.role,
        author_avatar: presignedAvatarUrl,
        user: p.user ? { ...p.user, avatar_url: presignedAvatarUrl } : null,
        comments_count: commentsCount,
        likes_count: likesCount,
      };
    })
  );

  return {
    posts: formattedPosts,
    total: totalCount,
  };
};

export const findById = async (id) => {
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (!post) return null;
  const presignedMediaUrl = await getPresignedGetUrl(post.media_url);
  return {
    ...post,
    media_url: presignedMediaUrl,
  };
};

export const deletePost = async (id) => {
  return await prisma.post.update({
    where: { id: parseInt(id, 10) },
    data: { status: "deleted" },
  });
};

export const updatePost = async (id, userId, content, mediaUrl) => {
  const updateData = { status: "updated" };
  if (content !== undefined && content !== null) updateData.content = content;
  if (mediaUrl !== undefined && mediaUrl !== null) updateData.media_url = sanitizeMediaUrl(mediaUrl);

  const updated = await prisma.post.updateMany({
    where: {
      id: parseInt(id, 10),
      user_id: parseInt(userId, 10),
    },
    data: updateData,
  });

  if (updated.count === 0) return null;

  return await findById(id);
};

export const findPostWithAuthor = async (id) => {
  const post = await prisma.post.findFirst({
    where: {
      id: parseInt(id, 10),
      status: { not: "deleted" },
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, email: true, role: true, avatar_url: true },
      },
    },
  });

  if (!post) return null;

  const [commentsCount, likesCount, presignedMediaUrl, presignedAvatarUrl] = await Promise.all([
    prisma.comment.count({
      where: { target_type: "post", target_id: post.id },
    }),
    prisma.like.count({
      where: { target_type: "post", target_id: post.id },
    }),
    getPresignedGetUrl(post.media_url),
    getPresignedGetUrl(post.user?.avatar_url),
  ]);

  return {
    ...post,
    media_url: presignedMediaUrl,
    author_name: post.user?.name,
    author_username: post.user?.username,
    author_email: post.user?.email,
    author_role: post.user?.role,
    author_avatar: presignedAvatarUrl,
    user: post.user ? { ...post.user, avatar_url: presignedAvatarUrl } : null,
    comments_count: commentsCount,
    likes_count: likesCount,
  };
};

/**
 * Toggles the pinned state of a post. Sets pinned_at to now if currently null,
 * clears it if already set. Only the post owner can pin.
 * @param {number} id
 * @param {number} userId
 * @returns {{ pinned: boolean, pinned_at: Date|null }}
 */
export const togglePin = async (id, userId) => {
  const post = await prisma.post.findFirst({
    where: { id: parseInt(id, 10), user_id: parseInt(userId, 10) },
    select: { id: true, pinned_at: true },
  });

  if (!post) return null;

  const newPinnedAt = post.pinned_at ? null : new Date();
  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { pinned_at: newPinnedAt },
    select: { id: true, pinned_at: true },
  });

  return { pinned: !!updated.pinned_at, pinned_at: updated.pinned_at };
};
