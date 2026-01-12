import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch("http://172.23.0.1:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) return alert(data.message);
        alert("Đăng ký thành công! Bạn có thể đăng nhập.");
        navigate("/login");
    } catch (err) {
        console.error(err);
            alert("Lỗi kết nối server");
        }
    };


  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          width: 360,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Tạo tài khoản
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Quản lý chi tiêu nhóm dễ dàng cùng ExpenseSplit
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Họ và tên"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            type="password"
            label="Mật khẩu"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <Button
            variant="contained"
            fullWidth
            type="submit"
            sx={{
              mt: 2,
              backgroundColor: "#7c3aed",
              "&:hover": { backgroundColor: "#6d28d9" },
            }}
          >
            Tạo tài khoản
          </Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Đã có tài khoản?{" "}
            <Link
              href="#"
              underline="hover"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Đăng nhập ngay
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
