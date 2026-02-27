import React from "react";
import Sidebar from "../components/Sidebar/Sidebar"; // Đường dẫn tuỳ project của bạn

import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* 1. Sidebar (Menu trái) */}
      <Sidebar />

      {/* 2. Content Area (Phần bên phải) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2.1 HEADER (Thanh trên cùng - Chứa chọn kho) */}
        <Header />

        {/* 2.2 MAIN CONTENT (Phần nội dung thay đổi: Dashboard, Product...) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 transition-all duration-200 ease-in-out">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
