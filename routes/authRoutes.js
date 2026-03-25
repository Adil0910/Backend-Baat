import express from "express";
import { register, login } from "../controllers/authController.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);

export default router;
