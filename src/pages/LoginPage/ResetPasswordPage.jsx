// src/pages/LoginPage/ResetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { resetPassword } from "../../services/authService";
import { validatePassword } from "../../utils/validators";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(formData.newPassword)) {
      return setError(
        "Mật khẩu chưa đủ mạnh (Min 6 ký tự, có hoa, thường, số/kí tự ĐB).",
      );
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: formData.newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đổi mật khẩu thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Đang chuyển hướng về trang đăng nhập...
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Tạo mật khẩu mới
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                required
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tối thiểu 6 ký tự..."
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                required
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Xác nhận mật khẩu..."
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all mt-4 disabled:opacity-70"
          >
            {loading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
