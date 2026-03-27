// src/pages/Profile/ProfilePage.jsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updateUserProfile, changePassword } from "../../services/userService";
import {
  FaUserCircle,
  FaPhone,
  FaLock,
  FaSave,
  FaSpinner,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);

  // --- STATE CHO FORM 1: THÔNG TIN ---
  const [infoData, setInfoData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [loadingInfo, setLoadingInfo] = useState(false);

  // --- STATE CHO FORM 2: MẬT KHẨU ---
  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setInfoData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // HÀM XỬ LÝ 1: LƯU THÔNG TIN
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    try {
      await updateUserProfile(infoData);
      alert("Cập nhật thông tin thành công!");
      await login(); // Refetch lại context để cập nhật Header
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
      setLoadingInfo(false);
    }
  };

  // HÀM XỬ LÝ 2: ĐỔI MẬT KHẨU
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passData.newPassword.length < 6) {
      return alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
    }
    if (passData.newPassword !== passData.confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }

    setLoadingPass(true);
    try {
      await changePassword({
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword,
      });
      alert("Đổi mật khẩu thành công!");
      // Reset form mật khẩu
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Thông tin cá nhân
      </h1>

      <div className="grid grid-cols-1 gap-8">
        {/* ================= FORM 1: THÔNG TIN CÁ NHÂN ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaUserCircle className="text-blue-500" /> Hồ sơ cơ bản
          </h3>

          <form onSubmit={handleUpdateInfo} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <FaUserCircle className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={infoData.fullName}
                    onChange={(e) =>
                      setInfoData({ ...infoData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={infoData.phone}
                    onChange={(e) =>
                      setInfoData({ ...infoData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={infoData.address}
                  onChange={(e) =>
                    setInfoData({ ...infoData, address: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingInfo}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all disabled:opacity-70"
              >
                {loadingInfo ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Cập nhật thông tin
              </button>
            </div>
          </form>
        </div>

        {/* ================= FORM 2: ĐỔI MẬT KHẨU ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaLock className="text-orange-500" /> Đổi mật khẩu
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={passData.oldPassword}
                onChange={(e) =>
                  setPassData({ ...passData, oldPassword: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự, phải bao gồm chữ hoa, chữ thường, số và ký tự"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={passData.newPassword}
                  onChange={(e) =>
                    setPassData({ ...passData, newPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={passData.confirmPassword}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingPass}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all disabled:opacity-70"
              >
                {loadingPass ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
