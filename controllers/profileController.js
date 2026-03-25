import User from "../models/User.js";
import fs from "fs";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password").populate("friends");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile (name, bio, profile image)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update name and bio
    if (name) user.name = name;
    if (bio) user.bio = bio;

    // Handle profile image update
    if (req.file) {
      // Delete old image if exists
      if (user.profileImage) {
        const oldImagePath = `uploads/${user.profileImage}`;
        fs.unlink(oldImagePath, (err) => {
          if (err) console.log("Error deleting old file");
        });
      }
      user.profileImage = req.file.filename;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users (for friends list)
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    res.status(200).json({
      message: "All users fetched",
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user status (online/offline/away)
export const updateUserStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    if (!["online", "offline", "away"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, lastSeen: new Date() },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Status updated",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
