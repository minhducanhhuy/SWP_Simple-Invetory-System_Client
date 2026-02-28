import React from "react";
import {
  FaWallet,
  FaBoxes,
  FaShoppingCart,
  FaChartLine,
  FaArrowDown,
  FaArrowUp,
  FaExclamationTriangle,
  FaUsers,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaWeightHanging,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatCard from "./StatCard";
import { Link } from "react-router-dom";

// Màu biểu đồ
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount || 0,
  );

// --- [MỚI] VIEW 1: SYSTEM ADMIN DASHBOARD (Chỉ cấu hình) ---
export const SystemDashboard = ({ data }) => (
  <div className="space-y-6">
    {/* 4 Cards Thống kê hệ thống */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tổng nhân sự"
        value={data.summary.totalUsers}
        icon={<FaUsers className="text-white" />}
        color="bg-blue-500"
        sub="Tài khoản hệ thống"
      />
      <StatCard
        title="Chi nhánh / Kho"
        value={data.summary.totalLocations}
        icon={<FaMapMarkerAlt className="text-white" />}
        color="bg-purple-500"
        sub="Điểm vận hành"
      />
      <StatCard
        title="Danh mục hàng"
        value={data.summary.totalCategories}
        icon={<FaLayerGroup className="text-white" />}
        color="bg-orange-500"
        sub="Nhóm sản phẩm"
      />
      <StatCard
        title="Đơn vị tính"
        value={data.summary.totalUnits}
        icon={<FaWeightHanging className="text-white" />}
        color="bg-green-500"
        sub="Đơn vị đo lường"
      />
    </div>

    {/* Bảng User mới nhất */}
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-bold text-gray-700">Nhân sự mới tham gia</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Tài khoản</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.lists.recentUsers?.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {u.username}
                </td>
                <td className="px-4 py-3 text-gray-600">{u.fullName}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {u.isActive ? "Active" : "Locked"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- VIEW 1: ADMIN DASHBOARD ---
export const BusinessDashboard = ({ data }) => (
  <>
    {/* 4 Cards */}
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Doanh thu"
        value={formatMoney(data.summary.revenue)}
        icon={<FaWallet className="text-white" />}
        color="bg-blue-500"
        sub="Tổng giá trị đơn bán"
      />
      <StatCard
        title="Lợi nhuận (Ước tính)"
        value={formatMoney(data.summary.profit)}
        icon={<FaChartLine className="text-white" />}
        color="bg-green-500"
        sub="Doanh thu - Giá vốn"
      />
      <StatCard
        title="Giá trị kho"
        value={formatMoney(data.summary.inventoryValue)}
        icon={<FaBoxes className="text-white" />}
        color="bg-purple-500"
        sub="Tổng vốn tồn kho"
      />
      <StatCard
        title="Tổng đơn hàng"
        value={data.summary.orders}
        icon={<FaShoppingCart className="text-white" />}
        color="bg-orange-500"
        sub="Số phiếu bán ra"
      />
    </div>

    {/* Biểu đồ */}
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="mb-6 font-bold text-gray-700">Doanh thu 7 ngày qua</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.charts.revenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                dy={10}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`
                }
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [formatMoney(value), "Doanh thu"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
        <h3 className="mb-6 font-bold text-gray-700">Tỷ trọng nhóm hàng</h3>
        <div className="flex h-[300px] w-full justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.charts.category}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.charts.category.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* (Thêm phần Table ở đây nếu cần, tương tự file cũ) */}
  </>
);

// --- VIEW 2: WAREHOUSE DASHBOARD ---
export const WarehouseDashboard = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* <StatCard
        title="Phiếu Nhập Hôm Nay"
        va
		  lue={data.summary.importToday}
        icon={<FaArrowDown className="text-white" />}
        color="bg-green-500"
      />
      <StatCard
        title="Phiếu Xuất Hôm Nay"
        value={data.summary.exportToday}
        icon={<FaArrowUp className="text-white" />}
        color="bg-blue-500"
      /> */}
      <Link to="/products">
        <StatCard
          title="Cảnh Báo Hết Hàng"
          value={data.lists.lowStock.length}
          icon={<FaExclamationTriangle className="text-white" />}
          color="bg-red-500"
        />
      </Link>
    </div>

    {/* Bảng Hàng Sắp Hết */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-700 mb-4 text-red-600 flex items-center gap-2">
        <FaExclamationTriangle /> Danh sách cần nhập hàng gấp
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3 text-center">Tồn kho</th>
              <th className="px-4 py-3 text-right">Định mức tối thiểu</th>
            </tr>
          </thead>
          <tbody>
            {data.lists.lowStock.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-center font-bold text-red-600">
                  {p.currentStock}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {p.minStock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
