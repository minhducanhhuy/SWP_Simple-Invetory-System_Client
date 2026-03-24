// src/pages/Profile/ProfilePage.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/userService"; // Import hàm update profile
import {
  FaUserCircle,
  FaPhone,
  FaLock,
  FaSave,
  FaSpinner,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ProfilePage = () => {
  const { user } = useContext(AuthContext); // Lấy info hiện tại
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    password: "", // Chỉ điền nếu muốn đổi
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Fill dữ liệu khi component load
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Password nếu có nhập
    if (formData.password) {
      if (formData.password.length < 6) return alert("Mật khẩu mới quá ngắn!");
      if (formData.password !== formData.confirmPassword)
        return alert("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      };
      // Chỉ gửi password nếu user nhập vào (muốn đổi)
      if (formData.password) {
        payload.password = formData.password;
      }

      await updateUserProfile(payload);
      alert("Cập nhật thông tin thành công!");
      // Có thể reload lại trang hoặc gọi hàm refreshUser trong context nếu có
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Thông tin cá nhân
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <FaUserCircle className="text-5xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.fullName}
            </h2>
            <p className="text-gray-500">@{user?.username}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <FaUserCircle className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* --- MỚI: ĐỊA CHỈ (Nằm dưới họ tên/SĐT) --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaLock className="text-gray-400" /> Đổi mật khẩu
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Để trống nếu không muốn thay đổi mật khẩu.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự, 1 hoa, 1 thường, 1 đặc biệt, 1 số"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập lại mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="Xác nhận"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-70"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
