import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserStatus,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, upload.single("profileImage"), updateUserProfile);
router.get("/all-users", authMiddleware, getAllUsers);
router.put("/status", authMiddleware, updateUserStatus);

export default router;
