import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import { getDashboardSummary } from "../../services/invoiceService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
  FaTrophy,
  FaBoxes,
} from "react-icons/fa";

const DashboardPage = () => {
  const { currentLocation } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (currentLocation) {
        setLoading(true);
        try {
          const res = await getDashboardSummary(currentLocation.id);
          setData(res);
        } catch (error) {
          console.error("Lỗi lấy dữ liệu dashboard", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDashboard();
  }, [currentLocation]);

  if (!currentLocation)
    return <div className="p-6">Đang kết nối chi nhánh...</div>;
  if (loading || !data)
    return (
      <div className="p-6 text-gray-500 font-bold animate-pulse">
        Đang tải biểu đồ...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <FaChartLine className="text-blue-600" /> TỔNG QUAN KINH DOANH
        </h1>
        <p className="text-gray-500">
          Dữ liệu cập nhật theo thời gian thực tại:{" "}
          <span className="font-bold text-blue-600">
            {currentLocation.name}
          </span>
        </p>
      </div>

      {/* 4 THẺ CHỈ SỐ TỔNG QUAN */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 transform hover:-translate-y-1 transition-transform">
          <p className="text-gray-500 font-bold mb-1 text-sm tracking-wider">
            DOANH THU HÔM NAY
          </p>
          <h2 className="text-3xl font-black text-green-600">
            {data.todayRevenue.toLocaleString("vi-VN")} ₫
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 transform hover:-translate-y-1 transition-transform">
          <p className="text-gray-500 font-bold mb-1 text-sm tracking-wider">
            ĐƠN HÀNG HÔM NAY
          </p>
          <h2 className="text-3xl font-black text-blue-600">
            {data.todayOrders} <span className="text-lg">đơn</span>
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500 transform hover:-translate-y-1 transition-transform">
          <p className="text-gray-500 font-bold mb-1 text-sm tracking-wider">
            CẢNH BÁO HẾT HÀNG
          </p>
          <h2 className="text-3xl font-black text-amber-500">
            {data.lowStockItems.length}{" "}
            <span className="text-lg">mặt hàng</span>
          </h2>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border-l-4 border-purple-500 transform hover:-translate-y-1 transition-transform">
          <p className="text-gray-400 font-bold mb-1 text-sm tracking-wider">
            TOP BÁN CHẠY NHẤT
          </p>
          <h2
            className="text-2xl font-black text-purple-400 line-clamp-1"
            title={data.topProducts[0]?.name}
          >
            {data.topProducts[0]?.name || "Chưa có dữ liệu"}
          </h2>
        </div>
      </div>

      {/* KHU VỰC BIỂU ĐỒ & TOP SẢN PHẨM */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Biểu đồ doanh thu (Chiếm 2 phần) */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-500" /> DOANH THU 7 NGÀY GẦN
            NHẤT
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  tickFormatter={(value) => `${value.toLocaleString("vi-VN")}`}
                  dx={-10}
                />
                <RechartsTooltip
                  cursor={{ fill: "#F3F4F6" }}
                  formatter={(value) => [
                    `${value.toLocaleString("vi-VN")} ₫`,
                    "Doanh thu",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 sản phẩm (Chiếm 1 phần) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaTrophy className="text-amber-500" /> TOP 5 SẢN PHẨM (TỔNG)
          </h3>
          <div className="space-y-4">
            {data.topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">Chưa có dữ liệu bán hàng</p>
            ) : (
              data.topProducts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-200 text-gray-600" : idx === 2 ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-500"}`}
                    >
                      #{idx + 1}
                    </div>
                    <span className="font-medium text-gray-700 text-sm line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-black text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                    {item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BẢNG CẢNH BÁO HẾT HÀNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          <h3 className="font-bold text-red-700">
            HÀNG SẮP HẾT (TỒN KHO ≤ 10)
          </h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 font-bold">Mã SKU</th>
              <th className="p-4 font-bold">Tên Sản Phẩm</th>
              <th className="p-4 font-bold text-right">Tồn Kho Hiện Tại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.lowStockItems.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-400">
                  Không có mặt hàng nào sắp hết
                </td>
              </tr>
            ) : (
              data.lowStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-red-50/50 transition">
                  <td className="p-4 font-mono text-sm font-bold text-gray-600">
                    {item.sku}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="p-4 font-black text-right text-red-600">
                    <span className="bg-red-100 px-2 py-1 rounded text-xs">
                      {item.quantity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
