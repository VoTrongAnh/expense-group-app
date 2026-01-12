import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import GroupDetailPage from "./pages/GroupDetailPage";
import AddExpensePage from "./pages/AddExpensePage";
import ChatPage from "./pages/ChatPage";
import SettlementPage from "./pages/SettlementPage";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* === CÁC ROUTE CÔNG KHAI === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* === CÁC ROUTE CẦN ĐĂNG NHẬP === */}
        <Route
          path="/home"
          element={token ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/group/:id"
          element={token ? <GroupDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/group/:id/add-expense"
          element={token ? <AddExpensePage /> : <Navigate to="/login" replace />}
        />
        {/* ✅ Đã thêm bảo vệ cho route chat */}
        <Route
          path="/group/:id/chat"
          element={token ? <ChatPage /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/group/:id/settlement"
          element={token ? <SettlementPage /> : <Navigate to="/login" replace />}
        />

        {/* === ROUTE MẶC ĐỊNH === */}
        {/* Nếu có token, vào /home, nếu không thì về /login */}
        <Route
          path="*"
          element={<Navigate to={token ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;