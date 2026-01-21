import React, { useState } from "react";
import "./LoginPage.css";
import { validatePassword, validateUsername } from "../../utils/validators";
import { loginUser } from "../../services/authService";

// Logo giả lập (thực tế bạn nên import từ assets)
const LogoIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6" />
    <path
      d="M2 17L12 22L22 17"
      stroke="#3B82F6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="#3B82F6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LoginPage = () => {
  // State quản lý input
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // State quản lý lỗi và trạng thái loading
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Handle thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear lỗi khi user bắt đầu gõ lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form trước khi submit
  const validateForm = () => {
    const newErrors = {};

    if (!validateUsername(formData.username)) {
      newErrors.username =
        "Username tối thiểu 5 ký tự, không chứa ký tự đặc biệt.";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Mật khẩu tối thiểu 6 ký tự, gồm chữ hoa, thường và ký tự đặc biệt.";
    }

    setErrors(newErrors);
    // Trả về true nếu không có lỗi (Object keys length = 0)
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await loginUser(formData);
      console.log("Login Success:", result);
      alert("Đăng nhập thành công!");
      // TODO: Lưu token và redirect (ví dụ: navigate('/dashboard'))
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header Section */}
        <div className="login-card__header">
          <div className="login-card__logo">
            <LogoIcon />
          </div>
          <h1 className="login-card__title">IMS Enterprise</h1>
          <p className="login-card__subtitle">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form Section */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="login-form__group">
            <label htmlFor="username" className="login-form__label">
              TÊN ĐĂNG NHẬP
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`login-form__input ${errors.username ? "login-form__input--error" : ""}`}
              placeholder="admin"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <span className="login-form__message">{errors.username}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="login-form__group">
            <label htmlFor="password" className="login-form__label">
              MẬT KHẨU
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`login-form__input ${errors.password ? "login-form__input--error" : ""}`}
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="login-form__message">{errors.password}</span>
            )}
          </div>

          {/* API Error Message */}
          {apiError && <div className="login-form__alert">{apiError}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-form__button"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        {/* Footer Helper */}
        <div className="login-card__footer">Default: admin / 123456</div>
      </div>
    </div>
  );
};

export default LoginPage;
