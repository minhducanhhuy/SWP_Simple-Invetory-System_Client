import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import "./LoginPage.css";
import { validatePassword, validateUsername } from "../../utils/validators";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext"; // 2. Import AuthContext

// Logo giả lập
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

  // 3. Khởi tạo hooks
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Handle thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Gọi API đăng nhập
      const result = await loginUser(formData);

      // 4. Cập nhật Auth Context (Lưu user info vào state toàn cục)
      login(result.user);

      // 5. Chuyển hướng sang Dashboard
      if (result.user.role === "SALESPERSON") {
        navigate("/pos");
      } else {
        navigate("/");
      }
    } catch (error) {
      setApiError(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
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
          <h1 className="login-card__title">IMS Mini Mart</h1>
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
              className={`login-form__input ${
                errors.username ? "login-form__input--error" : ""
              }`}
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
            <label htmlFor="password" className="login-form__label mb-0">
              MẬT KHẨU
            </label>

            <input
              type="password"
              id="password"
              name="password"
              className={`login-form__input ${
                errors.password ? "login-form__input--error" : ""
              }`}
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
            />

            {errors.password && (
              <span className="login-form__message">{errors.password}</span>
            )}

            <div className="mt-2">
              <Link
                to="/forgot-password"
                className=" text-xs font-semibold text-blue-600 hover:text-blue-800 my-8"
              >
                Quên mật khẩu?
              </Link>
            </div>
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
        <div className="login-card__footer">
          Default: owner, admin, manager_hn, warehouse_hn, sales_hn,
          manager_hcm, warehouse_hcm / 123456aA@
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
