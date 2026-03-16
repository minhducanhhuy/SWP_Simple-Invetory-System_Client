// src/pages/LoginPage/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { forgotPassword } from "../../services/authService";
import "./LoginPage.css"; // Dùng chung style của trang login

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Vui lòng nhập email");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header mb-6">
          <h2 className="login-card__title">Khôi phục mật khẩu</h2>
          <p className="text-sm text-gray-500 mt-2">
            Nhập email đã liên kết với tài khoản của bạn để nhận mã đặt lại.
          </p>
        </div>

        {message && (
          <div className="p-3 mb-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
            {message}
          </div>
        )}

        {error && <div className="login-form__alert mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form__group">
            <label className="login-form__label">EMAIL CỦA BẠN</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                required
                className="login-form__input !pl-10"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-form__button"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
          >
            <FaArrowLeft /> Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
