import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Box,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // ✅ dùng để điều hướng

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) return alert(data.message);
      
      localStorage.setItem("token", data.token);
      alert("Đăng nhập thành công!");
      console.log("User:", data.user);
      navigate("/home"); // ✅ chuyển đến trang chủ
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        value={form.email}
        onChange={handleChange}
        variant="outlined"
      />
      <TextField
        fullWidth
        margin="normal"
        label="Mật khẩu"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        variant="outlined"
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
        Đăng nhập
      </Button>

      <Typography variant="body2" sx={{ mt: 2 }}>
        Chưa có tài khoản?{" "}
        <Link
          href="#"
          underline="hover"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/register";
          }}
        >
          Đăng ký ngay
        </Link>
      </Typography>

      <Divider sx={{ my: 2 }}>Hoặc</Divider>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<Google />}
        sx={{ textTransform: "none" }}
      >
        Đăng nhập với Google
      </Button>
    </Box>
  );
}
