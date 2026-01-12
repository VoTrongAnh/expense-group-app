// frontend/src/pages/GroupDetailPage.js

import React, { useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import {
  Box, Typography, IconButton, Avatar, Button, Divider, Card, 
  CardContent, Stack, Dialog, DialogTitle, DialogContent, 
  TextField, DialogActions, Snackbar, Alert, CardHeader
} from "@mui/material";
import {
  ArrowBack, Chat, Delete, Add, Person, Description, CalendarToday,
  Group, PersonAdd, ReceiptLong
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Import jwtDecode

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [openAddFriend, setOpenAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  
  // ✅ 1. Thêm state cho dialog xóa NHÓM
  const [openDeleteGroupDialog, setOpenDeleteGroupDialog] = useState(false);

  // Lấy thông tin user hiện tại từ token
  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null;
  // Kiểm tra xem có phải chủ nhóm không (chỉ khi `group` đã được tải)
  const isOwner = group?.owner === currentUser?.id; 

  const fetchGroupDetail = async () => {
    try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_URL;
        const [groupRes, expensesRes] = await Promise.all([
            fetch(`${apiUrl}/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${apiUrl}/api/groups/${id}/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const groupData = await groupRes.json();
        const expenseData = await expensesRes.json();
        if (groupRes.ok) setGroup(groupData);
        if (expensesRes.ok) setExpenses(expenseData);
    } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchGroupDetail();
  }, [id]);

  const handleAddFriend = async () => {
    try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_URL;
        const res = await fetch(`${apiUrl}/api/groups/${id}/add-member`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ email: friendEmail }),
        });
        const data = await res.json();
        if (res.ok) {
            setSnackbar({ open: true, message: "Thêm bạn thành công!", severity: "success" });
            setOpenAddFriend(false);
            setFriendEmail("");
            fetchGroupDetail();
        } else {
            setSnackbar({ open: true, message: data.message || "Không tìm thấy email", severity: "error" });
        }
    } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Lỗi server", severity: "error" });
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await fetch(`${apiUrl}/api/groups/${id}/expenses/${expenseToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses(prevExpenses => prevExpenses.filter(ex => ex._id !== expenseToDelete._id));
        setSnackbar({ open: true, message: "Xóa chi tiêu thành công!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: data.msg || "Xóa thất bại", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Lỗi server", severity: "error" });
    } finally {
      setOpenDeleteDialog(false);
      setExpenseToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (expense) => {
    setExpenseToDelete(expense);
    setOpenDeleteDialog(true);
  };

  // ✅ 2. Tạo hàm xử lý xóa NHÓM
  const handleDeleteGroup = async () => {
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const res = await fetch(`${apiUrl}/api/groups/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            // Chuyển hướng về trang chủ sau khi xóa thành công
            // Truyền state để trang chủ có thể hiển thị thông báo
            navigate('/home', { state: { message: 'Xóa nhóm thành công!', severity: 'success' } });
        } else {
            const data = await res.json();
            setSnackbar({ open: true, message: data.msg || 'Xóa nhóm thất bại', severity: 'error' });
        }
    } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: 'Lỗi server', severity: 'error' });
    } finally {
        setOpenDeleteGroupDialog(false);
    }
  };

  if (!group) {
    return (
      <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", backgroundColor: "#f5f3ff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/home")}> <ArrowBack /> </IconButton>
          <Typography variant="h6" fontWeight="bold"> {group.name} </Typography>
        </Box>
        <Box>
          <IconButton onClick={() => navigate(`/group/${id}/chat`)}> <Chat /> </IconButton>
          <IconButton onClick={() => navigate(`/group/${id}/settlement`)}> <ReceiptLong /> </IconButton>
          <IconButton color="primary" onClick={() => setOpenAddFriend(true)}> <PersonAdd /> </IconButton>
          
          {/* ✅ 3. Thêm nút xóa nhóm và chỉ hiển thị cho chủ nhóm */}
          {isOwner && (
            <IconButton color="error" onClick={() => setOpenDeleteGroupDialog(true)}>
              <Delete />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Danh sách thành viên */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 3, py: 2, overflowX: "auto" }}>
        {group.members.map((m) => (
          <Box key={m._id} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar sx={{ width: 48, height: 48, mb: 0.5 }}>{m.name?.[0]?.toUpperCase() || <Person />}</Avatar>
            <Typography variant="body2" noWrap>{m.name}</Typography>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Danh sách chi tiêu */}
      <Box sx={{ flexGrow: 1, px: 2, py: 2, overflowY: "auto" }}>
        {expenses.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h1" sx={{ color: "#a78bfa" }}> 🧾 </Typography>
            <Typography variant="h6" fontWeight="bold"> Chưa có chi tiêu nào </Typography>
            <Typography variant="body2" color="text.secondary"> Thêm chi tiêu để bắt đầu! </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {expenses.map((ex) => (
              <Card key={ex._id} sx={{ borderRadius: 3, backgroundColor: "#faf5ff", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <CardHeader
                  action={
                    <IconButton aria-label="delete expense" onClick={() => handleOpenDeleteDialog(ex)}>
                      <Delete color="error" />
                    </IconButton>
                  }
                  title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Description sx={{ color: "#7c3aed", mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight="bold">{ex.title}</Typography>
                      </Box>
                  }
                  sx={{ pb: 0, alignItems: 'flex-start' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="h6" color="#4c1d95" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    {ex.amount.toLocaleString('vi-VN')} đ
                  </Typography>
                  <Typography variant="body2" color="text.secondary"> {ex.paidBy?.name} đã trả </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                    {ex.date ? format(parseISO(ex.date), "dd/MM/yyyy") : "Chưa có ngày"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Group sx={{ fontSize: 14, mr: 0.5 }} />
                    {ex.splits?.length || 0} người tham gia
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Nút thêm chi tiêu */}
      <Box sx={{ display: "flex", justifyContent: "center", py: 2, borderTop: "1px solid #e5e7eb", backgroundColor: "#faf5ff" }}>
        <Button variant="contained" startIcon={<Add />}
          sx={{ backgroundColor: "#8b5cf6", textTransform: "none", borderRadius: 3, px: 4, "&:hover": { backgroundColor: "#7c3aed" } }}
          onClick={() => navigate(`/group/${id}/add-expense`)}
        >
          Thêm chi tiêu
        </Button>
      </Box>
      
      {/* Dialog thêm bạn */}
      <Dialog open={openAddFriend} onClose={() => setOpenAddFriend(false)}>
        <DialogTitle>Thêm bạn vào nhóm</DialogTitle>
        <DialogContent>
            <TextField autoFocus margin="dense" label="Email" type="email" fullWidth value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenAddFriend(false)}>Hủy</Button>
            <Button onClick={handleAddFriend} variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar thông báo */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Dialog xác nhận xóa CHI TIÊU */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa chi tiêu</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa chi tiêu "{expenseToDelete?.title}" không? Hành động này không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteExpense} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ 4. Thêm Dialog xác nhận xóa NHÓM */}
      <Dialog open={openDeleteGroupDialog} onClose={() => setOpenDeleteGroupDialog(false)}>
        <DialogTitle>Xác nhận xóa nhóm</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhóm "{group?.name}" không? Tất cả chi tiêu và tin nhắn trong nhóm cũng sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteGroupDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteGroup} color="error" variant="contained">
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}