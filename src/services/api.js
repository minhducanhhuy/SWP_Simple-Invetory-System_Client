// src/services/api.js
import axios from "axios";
import { logoutUser } from "./authService";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3040",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalRequestUrl = error.config?.url; // Lấy URL của API vừa bị lỗi

    // --- 1. XỬ LÝ LỖI 401 (UNAUTHORIZED) ---
    if (status === 401) {
      // [QUAN TRỌNG]: Bỏ qua việc hiển thị cảnh báo và redirect nếu là API check user hoặc login
      if (
        originalRequestUrl.includes("/users/me") ||
        originalRequestUrl.includes("/auth/login")
      ) {
        return Promise.reject(error); // Chỉ ném lỗi về cho AuthContext tự bắt, không làm gì cả
      }

      // Các trường hợp khác (đang dùng web mà hết hạn cookie) thì mới cảnh báo và đá ra
      alert(
        error.response?.data?.message ||
          "Phiên đăng nhập đã hết hạn hoặc tài khoản bị khóa!",
      );
      logoutUser();
      window.location.href = "/login";
    }

    // --- 2. XỬ LÝ LỖI 403 (FORBIDDEN) ---
    if (status === 403) {
      alert(
        error.response?.data?.message ||
          "⚠️ Bạn không có quyền thực hiện chức năng này!",
      );
    }

    return Promise.reject(error);
  },
);

export default api;
