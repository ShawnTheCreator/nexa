import express from "express";
import { login, signup, logout, verifyEmail, getProfile } from "../controllers/authControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);

// Protected routes
router.get("/profile", protectRoute, getProfile);

export default router;
