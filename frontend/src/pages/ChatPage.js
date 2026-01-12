import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Box, Typography, IconButton, TextField, Avatar, Paper } from "@mui/material";
import { ArrowBack, Send } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

const ChatPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [groupName, setGroupName] = useState("Đang tải..."); // ✅ Thêm trạng thái loading

  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null; // ✅ Sửa lỗi tên hàm
  const currentUserId = currentUser?.id;

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);
    newSocket.emit("join_group", groupId);

    newSocket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => {
        // ✅ Chống trùng lặp tin nhắn
        if (prevMessages.some(msg => msg._id === newMessage._id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
    });

    return () => newSocket.close();
  }, [groupId]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const resMessages = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${groupId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataMessages = await resMessages.json();
        if (resMessages.ok) setMessages(dataMessages);

        const resGroup = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataGroup = await resGroup.json();
        if (resGroup.ok) setGroupName(dataGroup.name);
      } catch (err) {
        console.error("Lỗi tải lịch sử chat:", err);
        setGroupName("Lỗi tải nhóm"); // ✅ Hiển thị lỗi nếu có
      }
    };
    if (token) fetchChatHistory();
  }, [groupId, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit("send_message", {
        groupId,
        content: newMessage,
        senderId: currentUserId,
      });
      setNewMessage("");
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: '#f0f2f5' }}>
      <Paper elevation={2} sx={{ display: "flex", alignItems: "center", p: 1, backgroundColor: 'white' }}>
        <IconButton onClick={() => navigate(`/group/${groupId}`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>{groupName}</Typography>
      </Paper>

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {messages.map((msg) => { // ✅ Bỏ index
          const isCurrentUser = msg.sender._id === currentUserId;
          return (
            <Box
              key={msg._id} // ✅ Dùng _id làm key
              sx={{
                display: "flex",
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '70%' }}>
                {!isCurrentUser && (
                  <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                    {msg.sender.name?.[0]?.toUpperCase()}
                  </Avatar>
                )}
                <Box>
                  {!isCurrentUser && <Typography variant="caption" color="text.secondary">{msg.sender.name}</Typography>}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 4,
                      backgroundColor: isCurrentUser ? "#8b5cf6" : "white",
                      color: isCurrentUser ? "white" : "black",
                      borderTopLeftRadius: isCurrentUser ? 16 : 4,
                      borderTopRightRadius: isCurrentUser ? 4 : 16,
                    }}
                  >
                    {msg.content}
                  </Paper>
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Paper elevation={3} sx={{ p: 1, backgroundColor: 'white' }}>
        <Box component="form" onSubmit={handleSendMessage} sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
          />
          <IconButton type="submit" color="primary" sx={{ ml: 1 }}>
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatPage;