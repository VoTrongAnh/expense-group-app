import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { GroupAdd, Logout, Groups, CalendarToday } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // ✅ thêm dòng này

export default function HomePage() {
  const navigate = useNavigate(); // ✅ khởi tạo điều hướng
  const [openDialog, setOpenDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  // 📦 Lấy danh sách nhóm khi load trang
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await fetch(`${apiUrl}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setGroups(data);
      else console.error("Lỗi:", data);
    } catch (err) {
      console.error("Lỗi tải nhóm:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert("Vui lòng nhập tên nhóm!");
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL;

      const res = await fetch(`${apiUrl}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);
      alert("✅ Nhóm đã được tạo thành công!");
      setOpenDialog(false);
      setGroupName("");
      fetchGroups();
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server!");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#f5f3ff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Nhóm Chi Tiêu
        </Typography>
        <Avatar
          src="/user-avatar.png"
          sx={{ width: 36, height: 36, cursor: "pointer" }}
        />
      </Box>

      {/* Nội dung chính */}
      <Box sx={{ flexGrow: 1, px: 2, py: 1, overflowY: "auto" }}>
        {groups.length === 0 ? (
          // Giao diện khi chưa có nhóm
          <Box
            sx={{
              textAlign: "center",
              mt: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Groups sx={{ fontSize: 80, color: "#a78bfa", mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Bạn chưa có nhóm nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tạo nhóm mới để bắt đầu quản lý chi tiêu cùng bạn bè.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#8b5cf6",
                textTransform: "none",
                borderRadius: 3,
                px: 4,
                py: 1,
                "&:hover": { backgroundColor: "#7c3aed" },
              }}
              onClick={() => setOpenDialog(true)}
            >
              Tạo nhóm đầu tiên
            </Button>
          </Box>
        ) : (
          // ✅ Giao diện khi đã có nhóm
          <Stack spacing={2}>
            {groups.map((group) => (
              <Card
                key={group._id}
                sx={{
                  borderRadius: 3,
                  backgroundColor: "#faf5ff",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#ede9fe" },
                }}
                onClick={() => navigate(`/group/${group._id}`)} // ✅ Bấm vào là đi đến trang chi tiết nhóm
              >
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <Groups sx={{ fontSize: 36, color: "#7c3aed", mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      👥 {group.members.length} thành viên
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                      {new Date(group.createdAt).toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Thanh điều hướng */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          py: 1,
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#faf5ff",
        }}
      >
        <Button
          startIcon={<GroupAdd />}
          sx={{ textTransform: "none", color: "#7c3aed" }}
          onClick={() => setOpenDialog(true)}
        >
          Tạo nhóm mới
        </Button>
        <Button
          startIcon={<Logout />}
          sx={{ textTransform: "none", color: "#6b7280" }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Đăng xuất
        </Button>
      </Box>

      {/* Dialog tạo nhóm */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Tạo nhóm mới</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Nhập tên nhóm để bắt đầu quản lý chi tiêu
          </Typography>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Tên nhóm"
            placeholder="Ví dụ: Đi chơi cuối tuần"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            InputProps={{
              startAdornment: <GroupAdd sx={{ mr: 1, color: "#8b5cf6" }} />,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#7c3aed",
              "&:hover": { backgroundColor: "#6d28d9" },
            }}
            onClick={handleCreateGroup}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
