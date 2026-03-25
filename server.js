import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("uploads")); // Serve uploaded files

// Handle old path format for backward compatibility
app.get("/uploads/:filename", (req, res) => {
  res.sendFile(`uploads/${req.params.filename}`, { root: "." });
});

// Connect Database
connectDB();

// Routes
app.use("/api", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/chat", chatRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Chat Backend API is running" });
});

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server URL
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User joins
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users_online", Array.from(onlineUsers.keys()));
    console.log("Online users:", Array.from(onlineUsers.keys()));
  });

  // Send message
  socket.on("send_message", (data) => {
    const { senderId, receiverId, message, timestamp } = data;
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", {
        senderId,
        message,
        timestamp,
      });
    }
  });

  // User typing
  socket.on("typing", (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_typing", { senderId });
    }
  });

  // Stop typing
  socket.on("stop_typing", (data) => {
    const { senderId, receiverId } = data;
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_stop_typing", { senderId });
    }
  });

  // User status change
  socket.on("status_change", (data) => {
    const { userId, status } = data;
    io.emit("user_status_changed", { userId, status });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("user_offline", userId);
        break;
      }
    }
    io.emit("users_online", Array.from(onlineUsers.keys()));
  });
});

export default server;
