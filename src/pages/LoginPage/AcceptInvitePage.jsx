import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FaCube,
  FaUser,
  FaLock,
  FaPhone,
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaAddressBook,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { acceptInvite } from "../../services/authService";
import { validatePassword, validateUsername } from "../../utils/validators";

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Lấy token từ URL: http://localhost:3000/auth/accept-invite?token=XYZ
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    username: "",
    password: "",
    address: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Nếu không có token -> Chặn truy cập
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateUsername(formData.username)) {
      setError(
        "Tên đăng nhập không hợp lệ (Từ 5-30 ký tự, chỉ chứa chữ cái, số, dấu gạch ngang hoặc gạch dưới).",
      );
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Mật khẩu chưa đủ mạnh (Tối thiểu 6 ký tự, phải có chữ hoa, chữ thường, số và ký tự đặc biệt).",
      );
      return;
    }

    // 3. Validate Confirm Password
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API Backend
      await acceptInvite({
        token: token,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        address: formData.address,
        phone: formData.phone,
      });

      setSuccess(true);
      // Chuyển hướng sau 3 giây
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Màn hình thành công
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <FaCheckCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Thiết lập thành công!
          </h2>
          <p className="text-gray-500 mb-6">
            Tài khoản của bạn đã được kích hoạt. <br />
            Hệ thống sẽ chuyển đến trang đăng nhập trong giây lát...
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4 py-8 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e40af] px-8 py-8 text-center">
          <div className="flex justify-center mb-3">
            <FaCube className="text-white text-4xl" />
          </div>
          <h1 className="text-white text-2xl font-bold uppercase tracking-wide">
            IMS Enterprise
          </h1>
          <p className="text-blue-200 text-sm mt-2">
            Hoàn tất hồ sơ để gia nhập hệ thống
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Kích hoạt tài khoản
          </h2>

          {error && (
            <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FaIdCard />
                </div>
                <input
                  required
                  name="fullName"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập họ tên đầy đủ"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FaPhone />
                </div>
                <input
                  required
                  name="phone"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* --- MỚI: ĐỊA CHỈ --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FaMapMarkerAlt />
                </div>
                <input
                  required
                  name="address"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập địa chỉ của bạn"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 my-2"></div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FaUser />
                </div>
                <input
                  required
                  name="username"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Chọn tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {/* Ghi chú quy tắc Username */}
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                <span className="text-blue-500 pt-0.5">ℹ️</span>
                Từ 5-30 ký tự, chỉ cho phép chữ cái, số, gạch ngang (-) và gạch
                dưới (_).
              </p>
            </div>

            {/* Password (Đã bỏ grid để xuống dòng) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FaLock />
                </div>
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập mật khẩu mạnh"
                  value={formData.password}
                  onChange={handleChange}
                />
                {/* Nút toggle password ngay trong input */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1" // Tránh tab vào nút này khi đang nhập liệu
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              {/* Ghi chú quy tắc Password */}
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                <span className="text-blue-500 pt-0.5">ℹ️</span>
                Tối thiểu 6 ký tự, phải bao gồm chữ hoa, chữ thường, số và ký tự
                đặc biệt.
              </p>
            </div>

            {/* Confirm Password (Xuống dòng dưới) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FaLock />
                </div>
                <input
                  required
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Xác nhận lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {/* Nút toggle password cho ô nhập lại (đồng bộ trạng thái) */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
