import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
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
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              backgroundColor: "#ede9fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <img
              src="/wallet-icon.png"
              alt="Logo"
              style={{ width: 36, height: 36 }}
            />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            ExpenseSplit
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chia sẻ chi tiêu. Không chia rẽ tình bạn.
          </Typography>
        </Box>

        <LoginForm />
      </Paper>
    </Box>
  );
}
