import prisma from "../../config/prisma.js";
import { getPresignedGetUrl } from "../../utils/s3.service.js";

export const toggleFollow = async (followerId, followingId) => {
  const fId = parseInt(followerId, 10);
  const targetId = parseInt(followingId, 10);

  if (fId === targetId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: fId,
        following_id: targetId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { id: existing.id },
    });
    return { isFollowing: false };
  } else {
    await prisma.follow.create({
      data: {
        follower_id: fId,
        following_id: targetId,
      },
    });
    return { isFollowing: true };
  }
};

export const checkIsFollowing = async (followerId, followingId) => {
  const count = await prisma.follow.count({
    where: {
      follower_id: parseInt(followerId, 10),
      following_id: parseInt(followingId, 10),
    },
  });
  return count > 0;
};

export const getFollowCounts = async (userId) => {
  const uId = parseInt(userId, 10);
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { following_id: uId } }),
    prisma.follow.count({ where: { follower_id: uId } }),
  ]);

  return {
    followersCount,
    followingCount,
  };
};

export const getFollowers = async (userId) => {
  const follows = await prisma.follow.findMany({
    where: { following_id: parseInt(userId, 10) },
    include: {
      follower: {
        select: { id: true, name: true, username: true, email: true, avatar_url: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return await Promise.all(
    follows.map(async (f) => {
      const presignedAvatar = await getPresignedGetUrl(f.follower.avatar_url);
      return {
        id: f.follower.id,
        name: f.follower.name,
        username: f.follower.username,
        email: f.follower.email,
        avatar_url: presignedAvatar,
        profile_picture: presignedAvatar,
        created_at: f.created_at,
      };
    })
  );
};

export const getFollowing = async (userId) => {
  const follows = await prisma.follow.findMany({
    where: { follower_id: parseInt(userId, 10) },
    include: {
      following: {
        select: { id: true, name: true, username: true, email: true, avatar_url: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return await Promise.all(
    follows.map(async (f) => {
      const presignedAvatar = await getPresignedGetUrl(f.following.avatar_url);
      return {
        id: f.following.id,
        name: f.following.name,
        username: f.following.username,
        email: f.following.email,
        avatar_url: presignedAvatar,
        profile_picture: presignedAvatar,
        created_at: f.created_at,
      };
    })
  );
};
