import React, { useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaChevronDown,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { logoutUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext"; // Import Context mới

const Header = () => {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // 1. Lấy thông tin User từ AuthContext
  const { user, logout } = useContext(AuthContext);

  // 2. Lấy thông tin Kho từ LocationContext (Thay thế cho code cũ)
  // locations: Danh sách tất cả kho
  // currentLocation: Kho đang được chọn
  // switchLocation: Hàm đổi kho
  const { locations, currentLocation, switchLocation } = useLocation();

  // 3. State cho UI (Ẩn/Hiện Dropdown)
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Khối: Xử lý Đăng xuất
  const handleLogout = async () => {
    try {
      await logoutUser(); // Gọi API xóa cookie
      logout(); // Xóa context
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  // Khối: Xử lý đổi kho
  const handleSwitchWarehouse = (warehouse) => {
    switchLocation(warehouse); // Context tự lo việc lưu vào localStorage
    setIsWarehouseOpen(false); // Chỉ việc đóng menu UI
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* --- LEFT: KHO (WAREHOUSE SELECTOR) --- */}
      <div className="relative">
        <button
          onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FaBuilding className="text-sm" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Đang làm việc tại kho
            </p>
            <div className="flex items-center gap-2">
              {/* Hiển thị tên kho từ Context */}
              <span className="text-sm font-bold text-gray-800">
                {currentLocation?.name || "Đang tải..."}
              </span>
              <FaChevronDown className="text-xs text-gray-400" />
            </div>
          </div>
        </button>

        {/* Dropdown list kho */}
        {isWarehouseOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-50 mb-1">
              Danh sách chi nhánh ({locations.length})
            </div>
            {locations.map((wh) => (
              <button
                key={wh.id}
                onClick={() => handleSwitchWarehouse(wh)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                  currentLocation?.id === wh.id
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentLocation?.id === wh.id
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                ></span>
                <div>
                  <div className="font-medium">{wh.name}</div>
                  <div className="text-[11px] text-gray-400">{wh.address}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- RIGHT: USER & NOTIFICATION --- */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notification Icon */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <FaBell className="text-lg" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserOpen(!isUserOpen)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-gray-800">
                {user?.fullName || "Người dùng"}
              </div>
              <div className="text-xs text-gray-500 uppercase">
                {user?.role || "Guest"}
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-gray-400">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-full h-full" />
              )}
            </div>
          </button>

          {/* User Menu Content */}
          {isUserOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 z-50">
              <div className="px-4 py-3 border-b border-gray-50 mb-1 md:hidden">
                <div className="text-sm font-bold text-gray-800">
                  {user?.fullName}
                </div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>

              <div className="px-4 py-2 border-b border-gray-50 hidden md:block">
                <p className="text-xs text-gray-400">Đăng nhập với</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <FaUserCircle className="text-gray-400" />
                Hồ sơ cá nhân
              </Link>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <FaCog className="text-gray-400" /> Cài đặt tài khoản
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
              >
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
