const Post = require("./post.model");

const createPost = async (req, res, next) => {
  try {
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const newPost = await Post.create(userId, content, mediaUrl);
    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const data = await Post.findAll(limit, offset);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const data = await Post.findByUserId(userId, limit, offset);
    res.status(200).json(data);
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
        message: "Post not found or you are not authorized to delete it" 
      });
    }

    res.status(200).json({
      message: "Post deleted successfully",
      post: deletedPost
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
