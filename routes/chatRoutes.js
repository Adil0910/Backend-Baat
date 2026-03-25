import express from "express";
import {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/messages/:receiverId", authMiddleware, getMessages);
router.post("/send-message", authMiddleware, upload.single("image"), sendMessage);
router.put("/mark-as-read", authMiddleware, markAsRead);
router.get("/unread-count", authMiddleware, getUnreadCount);

export default router;
