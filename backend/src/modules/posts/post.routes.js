import express from "express";
import { createPost, getAllPosts, getUserPosts, deletePost, updatePost, getPostById, pinPost } from "./post.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = express.Router();

// Routes for Posts
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/user/:userId", getUserPosts);

// Protected routes (require user to be logged in)
router.post("/", ensureAuthenticated, createPost);
router.put("/:id", ensureAuthenticated, updatePost);
router.delete("/:id", ensureAuthenticated, deletePost);

// Pin/unpin — owner only (ownership verified inside controller)
router.patch("/:id/pin", ensureAuthenticated, pinPost);

export default router;

