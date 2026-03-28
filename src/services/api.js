// src/services/api.js
import axios from "axios";
import { logoutUser } from "./authService";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3040",

  // --- DÒNG QUAN TRỌNG NHẤT ---
  // Tự động gửi Cookie đi kèm trong mọi request (GET, POST, PUT...)
  withCredentials: true,
  // ---------------------------

  headers: {
    "Content-Type": "application/json",
  },
});

// (Optional) Interceptor để xử lý lỗi toàn cục
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // --- 1. XỬ LÝ LỖI 401 (UNAUTHORIZED) ---
    // (Chưa đăng nhập, Hết hạn Token, hoặc Tài khoản bị khóa)
    if (status === 401) {
      alert(
        error.response?.data?.message ||
          "Phiên đăng nhập đã hết hạn hoặc tài khoản bị khóa!",
      );

      // Xóa thông tin đăng nhập và đá văng ra trang login
      logoutUser();
      window.location.href = "/login";
    }

    // --- 2. XỬ LÝ LỖI 403 (FORBIDDEN) ---
    // (Đã đăng nhập nhưng bấm nhầm nút không có quyền)
    if (status === 403) {
    }

    return Promise.reject(error);
  },
);

export default api;

//
