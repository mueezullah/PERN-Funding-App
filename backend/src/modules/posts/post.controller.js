const Post = require("./post.model");
const { getPaginationData, parsePaginationParams } = require("../../utils/pagination");

const createPost = async (req, res, next) => {
  try {
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ success: false, message: "Post content is required" });
    }

    const newPost = await Post.create(userId, content, mediaUrl);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost
    });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);
    const offset = (page - 1) * limit;

    const { posts, total } = await Post.findAll(limit, offset);
    
    res.status(200).json({ 
      success: true, 
      data: {
        posts,
        pagination: getPaginationData(total, page, limit)
      } 
    });
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { page, limit } = parsePaginationParams(req.query.page, req.query.limit);
    const offset = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const { posts, total } = await Post.findByUserId(userId, limit, offset);
    res.status(200).json({ 
      success: true, 
      data: {
        posts,
        pagination: getPaginationData(total, page, limit)
      } 
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const deletedPost = await Post.delete(postId, userId);

    if (!deletedPost) {
      return res.status(404).json({ 
        success: false,
        message: "Post not found or you are not authorized to delete it" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: deletedPost
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost
};
