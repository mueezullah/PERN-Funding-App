import prisma from "../../config/prisma.js";

export const initTable = async () => {
  console.log("Comments table verified via Prisma");
};

export const create = async (userId, targetType, targetId, content, parentId = null) => {
  return await prisma.comment.create({
    data: {
      user_id: parseInt(userId, 10),
      target_type: targetType,
      target_id: parseInt(targetId, 10),
      content,
      parent_id: parentId ? parseInt(parentId, 10) : null,
    },
  });
};

export const findByTarget = async (targetType, targetId, since = null) => {
  const whereCondition = {
    target_type: targetType,
    target_id: parseInt(targetId, 10),
  };

  if (since) {
    whereCondition.created_at = { gt: new Date(since) };
  }

  const comments = await prisma.comment.findMany({
    where: whereCondition,
    include: {
      user: {
        select: { name: true, username: true, role: true },
      },
      parent: {
        select: {
          id: true,
          user: {
            select: { name: true, username: true },
          },
        },
      },
    },
    orderBy: [
      { created_at: "asc" },
      { id: "asc" },
    ],
  });

  return comments.map((c) => ({
    ...c,
    author_name: c.user?.name,
    author_username: c.user?.username,
    author_role: c.user?.role,
    author_avatar: c.user?.avatar_url,
    reply_to_name: c.parent?.user?.name,
    reply_to_username: c.parent?.user?.username,
  }));
};

export const countByTarget = async (targetType, targetId) => {
  return await prisma.comment.count({
    where: {
      target_type: targetType,
      target_id: parseInt(targetId, 10),
    },
  });
};

export const findById = async (commentId) => {
  return await prisma.comment.findUnique({
    where: { id: parseInt(commentId, 10) },
  });
};

export const deleteById = async (commentId) => {
  return await prisma.comment.delete({
    where: { id: parseInt(commentId, 10) },
  });
};
