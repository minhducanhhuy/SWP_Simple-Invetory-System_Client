// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { getProfile, logoutUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập khi F5 trang
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // SỬA Ở ĐÂY: Nhận trực tiếp userData từ LoginPage, bỏ async và getProfile()
  const login = (userData) => {
    setUser(userData); // Cập nhật state đồng bộ, ngay lập tức
  };

  // SỬA Ở ĐÂY: Nên thêm async/await để đợi server clear cookie xong mới chuyển trang
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Lỗi khi gọi API logout", error);
    } finally {
      setUser(null); // Xóa user state
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
