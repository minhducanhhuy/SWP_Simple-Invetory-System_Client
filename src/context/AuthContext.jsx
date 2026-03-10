// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { getProfile, logoutUser } from "../services/authService";
import { Navigate, useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Trạng thái đang check login
  const navigate = useNavigate();

  // Mỗi lần F5 trang web, chạy cái này đầu tiên
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Gọi API thử xem cookie còn sống không
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        // Nếu lỗi (401) nghĩa là cookie hết hạn hoặc chưa đăng nhập
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
