// src/pages/Dashboard/DashboardPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/dashboardService";

// Import Views
import {
  SystemDashboard, // [MỚI] Dành cho ADMIN_SYSTEM
  BusinessDashboard, // [MỚI] Dành cho OWNER/MANAGER (AdminDashboard cũ)
  WarehouseDashboard,
} from "./components/DashboardViews";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const result = await getDashboardStats();
        setData(result);
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-10 text-center">Không có dữ liệu.</div>;

  // Render view dựa trên Role
  const renderContent = () => {
    switch (user?.role) {
      case "ADMIN_SYSTEM":
        return <SystemDashboard data={data} />; // View cấu hình

      case "OWNER":
      case "MANAGER":
        return <BusinessDashboard data={data} />; // View tiền nong

      case "WAREHOUSE_STAFF":
        return <WarehouseDashboard data={data} />;

      case "SALESPERSON":
        return navigate("/products");

      default:
        return <div className="text-gray-500">Vai trò không xác định</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-sm text-gray-500">
          Xin chào,{" "}
          <span className="font-bold text-blue-600">{user?.fullName}</span>
          <span className="mx-2">|</span>
          Vai trò:{" "}
          <span className="font-bold text-orange-600">{user?.role}</span>
        </p>
      </div>

      {renderContent()}
    </div>
  );
};

export default DashboardPage;
