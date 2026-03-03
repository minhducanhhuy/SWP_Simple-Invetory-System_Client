// src/components/Sidebar.jsx
import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "./Sidebar.css";

import {
  FaCube,
  FaChartPie,
  FaBoxes,
  FaFileInvoice,
  FaTruck,
  FaUsers,
  FaSignOutAlt,
  FaWarehouse,
} from "react-icons/fa";
import { FaSliders } from "react-icons/fa6";
import { IoIosCreate } from "react-icons/io";
import { AuthContext } from "../../context/AuthContext";
import { logoutUser } from "../../services/authService";

const Sidebar = () => {
  const location = useLocation();
  // Lấy thông tin user từ Context để check role
  const { user, logout } = useContext(AuthContext);
  // === THÊM ĐOẠN CODE NÀY VÀO ===
  // Nếu user là null (đã logout), không render Sidebar nữa để tránh lỗi crash
  if (!user) return null;
  // ===============================

  const userRole = user?.role || "";

  const isActive = (path) => location.pathname === path;

  const getItemClass = (path) => {
    const baseClass =
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium items-center";
    const activeClass = "bg-[#1d4ed8] text-white shadow-inner";
    const inactiveClass =
      "text-blue-100 hover:bg-[#1e40af] hover:text-white hover:bg-opacity-90";

    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const handleLogout = () => {
    logoutUser(); // xóa token
    logout(); // điều hướng
  };

  // Cấu hình danh sách menu và quyền truy cập
  // allowedRoles: Các role được phép nhìn thấy menu này
  const MENU_GROUPS = [
    {
      label: "Đối tác & Vận hành",
      items: [
        {
          path: "/suppliers",
          label: "Nhà cung cấp",
          icon: <FaTruck className="h-5 w-5" />,
          allowedRoles: ["OWNER", "MANAGER"], // ADMIN_SYSTEM không thấy
        },
      ],
    },
    {
      label: "Quản lý kho",
      items: [
        {
          path: "/products",
          label: "Sản phẩm",
          icon: <FaBoxes className="h-5 w-5" />,
          allowedRoles: ["OWNER", "MANAGER", "WAREHOUSE_STAFF", "SALESPERSON"],
        },
        {
          path: "/stock-tickets/create",
          label: "Tạo phiếu",
          icon: <IoIosCreate className="h-5 w-5" />,
          allowedRoles: ["WAREHOUSE_STAFF", "MANAGER", "OWNER"],
        },
        {
          path: "/stock-tickets",
          label: "Lịch sử thay đổi",
          icon: <FaFileInvoice className="h-5 w-5" />,
          allowedRoles: ["WAREHOUSE_STAFF", "OWNER", "MANAGER"],
        },
      ],
    },
    {
      label: "Đối tác & Vận hành",
      items: [
        {
          path: "/customers",
          label: "Khách hàng",
          icon: <FaUsers className="h-5 w-5" />,
          allowedRoles: ["SALESPERSON"], // ADMIN_SYSTEM không thấy
        },
      ],
    },
    {
      label: "Quản trị hệ thống", // Group mới cho Admin System
      items: [
        {
          path: "/employees",
          label: "Nhân viên",
          icon: <FaUsers className="h-5 w-5" />,
          allowedRoles: ["ADMIN_SYSTEM"], // Chỉ hiện cho role này
        },
        {
          path: "/master-data",
          label: "Cấu hình chung", // Có thể trỏ về Dashboard hoặc trang riêng
          icon: <FaSliders className="h-5 w-5" />,
          allowedRoles: ["ADMIN_SYSTEM"],
        },
        {
          path: "/locations",
          label: "Quản lý Kho",
          icon: <FaWarehouse className="h-5 w-5" />, // Nhớ import icon
          allowedRoles: ["ADMIN_SYSTEM"], // Chỉ Admin/Owner mới thấy
        },
      ],
    },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 z-20 flex-col bg-[#172554] font-sans text-white shadow-2xl transition-all duration-300">
      {/* 1. HEADER LOGO */}
      <div className="flex h-16 items-center border-b border-[#1e40af]/50 bg-[#172554] px-6">
        <div className="flex items-center gap-3">
          <FaCube className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-bold uppercase tracking-wide">
            IMS Enterprise
          </h1>
        </div>
      </div>

      {/* 2. MENU CONTENT - RENDER DYNAMIC */}
      <div className="sidebar-scroll flex-1 space-y-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
        {MENU_GROUPS.map((group, groupIndex) => {
          // Lọc các items mà user hiện tại có quyền xem
          const visibleItems = group.items.filter((item) =>
            item.allowedRoles.includes(userRole),
          );

          // Nếu nhóm không có item nào được hiển thị thì ẩn cả nhóm (Label)
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIndex}>
              <div className="mb-2 mt-4 px-3 text-xs font-bold uppercase tracking-wider text-blue-400/80">
                {group.label}
              </div>
              {visibleItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getItemClass(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      {/* 3. LOGOUT BUTTON (Luôn hiển thị) */}
      <div className="border-t border-[#1e40af]/50 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-blue-100 hover:bg-red-600/90 hover:text-white transition-colors"
        >
          <FaSignOutAlt className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
