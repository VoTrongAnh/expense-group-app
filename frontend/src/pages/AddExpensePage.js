// src/pages/AddExpensePage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { ArrowBack, CalendarToday, AttachMoney } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

export default function AddExpensePage() {
  const { id } = useParams(); // id nhóm
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paidBy, setPaidBy] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [splitEvenly, setSplitEvenly] = useState(true);

  // 🟣 Lấy thông tin nhóm
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today); // ✅ mặc định là ngày hiện tại

    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_URL;
        const res = await fetch(`${apiUrl}/api/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setGroup(data);
          setParticipants(data.members.map((m) => m._id));
        }
      } catch (err) {
        console.error("Lỗi tải nhóm:", err);
      }
    };
    fetchGroup();
  }, [id]);

  // 🟢 Lưu chi tiêu
  const handleSaveExpense = async () => {
    if (!description.trim() || !amount.trim() || !paidBy)
      return alert("Vui lòng nhập đầy đủ thông tin chi tiêu!");

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await fetch(`${apiUrl}/api/groups/${id}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: description,
          amount: Number(amount),
          paidBy,
          date,
          splits: participants.map((p) => ({
            userId: p,
            share: splitEvenly ? Number(amount) / participants.length : 0,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      alert("✅ Thêm chi tiêu thành công!");
      navigate(`/group/${id}`);
    } catch (err) {
      console.error("Lỗi lưu chi tiêu:", err);
      alert("Lỗi kết nối server!");
    }
  };

  if (!group)
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#f5f3ff",
        display: "flex",
        flexDirection: "column",
        px: 3,
        py: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ArrowBack sx={{ cursor: "pointer", mr: 1 }} onClick={() => navigate(-1)} />
        <Typography variant="h6" fontWeight="bold">
          Thêm chi tiêu
        </Typography>
      </Box>

      {/* Thông tin chi tiêu */}
      <Box sx={{ backgroundColor: "#faf5ff", borderRadius: 3, p: 2, mb: 3 }}>
        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Thông tin chi tiêu
        </Typography>
        <TextField
          fullWidth
          label="Mô tả chi tiêu"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Số tiền"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputProps={{ startAdornment: <AttachMoney sx={{ mr: 1 }} /> }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Ngày chi tiêu"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)} // ✅ vẫn có thể sửa
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Ai đã thanh toán */}
      <Box sx={{ backgroundColor: "#faf5ff", borderRadius: 3, p: 2, mb: 3 }}>
        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Ai đã thanh toán?
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {group.members.map((m) => (
            <Box
              key={m._id}
              onClick={() => setPaidBy(m._id)}
              sx={{
                borderRadius: 3,
                p: 1,
                textAlign: "center",
                flex: 1,
                border: paidBy === m._id ? "2px solid #7c3aed" : "1px solid #ddd",
                backgroundColor: paidBy === m._id ? "#ede9fe" : "#fff",
                cursor: "pointer",
              }}
            >
              <Avatar sx={{ mx: "auto", mb: 0.5 }} src="/user-avatar.png" />
              <Typography variant="body2">{m.name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Người tham gia */}
      <Box sx={{ backgroundColor: "#faf5ff", borderRadius: 3, p: 2, mb: 3 }}>
        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Người tham gia chi tiêu
        </Typography>
        {group.members.map((m) => (
          <Box key={m._id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }} src="/user-avatar.png" />
            <Typography sx={{ flexGrow: 1 }}>{m.name}</Typography>
            <Checkbox
              checked={participants.includes(m._id)}
              onChange={(e) => {
                if (e.target.checked)
                  setParticipants([...participants, m._id]);
                else
                  setParticipants(participants.filter((p) => p !== m._id));
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Phương thức chia tiền */}
      <Box sx={{ backgroundColor: "#faf5ff", borderRadius: 3, p: 2, mb: 3 }}>
        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Phương thức chia tiền
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={splitEvenly}
              onChange={(e) => setSplitEvenly(e.target.checked)}
              color="secondary"
            />
          }
          label="Chia đều cho tất cả"
        />
      </Box>

      {/* Nút lưu */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: "#7c3aed",
          textTransform: "none",
          borderRadius: 3,
          py: 1.2,
          fontWeight: "bold",
          "&:hover": { backgroundColor: "#6d28d9" },
        }}
        onClick={handleSaveExpense}
      >
        Lưu chi tiêu
      </Button>
    </Box>
  );
}
