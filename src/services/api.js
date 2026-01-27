// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",

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
    if (error.response?.status === 401) {
      // Nếu lỗi 401 (Hết hạn cookie/Chưa đăng nhập) -> Đá văng ra trang login
      // window.location.href = '/login';
      console.log("Phiên đăng nhập hết hạn");
    }
    return Promise.reject(error);
  },
);

export default api;
