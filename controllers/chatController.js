import Chat from "../models/Chat.js";

// Get all messages between two users
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;

    const messages = await Chat.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Messages fetched",
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!message && !req.file) {
      return res.status(400).json({ error: "Message or image is required" });
    }

    const newMessage = new Chat({
      sender: senderId,
      receiver: receiverId,
      message: message || "",
      image: req.file ? req.file.filename : null,
    });

    await newMessage.save();

    await newMessage.populate("sender", "name profileImage");
    await newMessage.populate("receiver", "name profileImage");

    res.status(201).json({
      message: "Message sent successfully",
      chat: newMessage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    await Chat.updateMany(
      { sender: senderId, receiver: receiverId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Chat.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      message: "Unread count fetched",
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
