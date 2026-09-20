import { Router } from "express";
import { toggleBookmark, getBookmarks } from "./bookmark.controller.js";
import { ensureAuthenticated } from "../auth/auth.middleware.js";

const router = Router();

// All bookmark routes require authentication — bookmarks are private to the current user
router.post("/", ensureAuthenticated, toggleBookmark);
router.get("/", ensureAuthenticated, getBookmarks);

export default router;
