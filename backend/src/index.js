// backend/src/index.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http"; // ✅ Thêm createServer
import { Server } from "socket.io";   // ✅ Thêm Server từ socket.io

import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groups.js";
import Message from "./models/Message.js"; // ✅ Import Message model

dotenv.config();

const app = express();
const httpServer = createServer(app); // ✅ Tạo HTTP server từ app
const io = new Server(httpServer, {    // ✅ Khởi tạo socket.io server
  cors: {
    origin: "http://localhost:3001", // ✅ Cho phép frontend kết nối
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Logic xử lý Socket.IO
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Khi user tham gia một nhóm chat
  socket.on("join_group", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Khi user gửi tin nhắn
  socket.on("send_message", async (data) => {
    const { groupId, content, senderId } = data;

    // 1. Lưu tin nhắn vào DB
    const message = new Message({
      group: groupId,
      content,
      sender: senderId,
    });
    await message.save();

    // Lấy thông tin sender để gửi kèm
    const populatedMessage = await Message.findById(message._id).populate("sender", "name");

    // 2. Gửi tin nhắn đến tất cả mọi người trong phòng
    io.to(groupId).emit("receive_message", populatedMessage);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});


// Start server
const PORT = process.env.PORT || 4000;
// ✅ Thay app.listen thành httpServer.listen
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));