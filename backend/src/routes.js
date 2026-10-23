import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import campaignRoutes from "./modules/campaigns/campaign.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import paymentRoutes from "./modules/payments/payments.route.js";
import userRoutes from "./modules/users/user.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import likeRoutes from "./modules/likes/like.routes.js";
import followRoutes from "./modules/follows/follow.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import kycRoutes from "./modules/kyc/kyc.routes.js";
import bookmarkRoutes from "./modules/bookmarks/bookmark.routes.js";
import exploreRoutes from "./modules/explore/explore.routes.js";
import searchRoutes from "./modules/search/search.routes.js";

const router = express.Router();

// Testing route
router.get("/health", (req, res) => res.send("Working Perfectly Well!!!"));

// Mount module routes
router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/posts", postRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/follows", followRoutes);
router.use("/upload", uploadRoutes);
router.use("/admin", adminRoutes);
router.use("/kyc", kycRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/explore", exploreRoutes);
router.use("/search", searchRoutes);

export default router;
