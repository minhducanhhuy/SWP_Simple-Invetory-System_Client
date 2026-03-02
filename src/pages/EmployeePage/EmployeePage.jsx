import React, { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaWarehouse,
} from "react-icons/fa";
import {
  getEmployees,
  inviteEmployee,
  deleteEmployee,
  updateEmployeeRole,
  assignUserLocations,
} from "../../services/employeeService";

// Import các component con
import InviteUserModal from "./components/InviteUserModal";
import EditRoleModal from "./components/EditRoleModal";
import { getMyLocations } from "../../services/locationService";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Data cho modal edit

  const ROLES = [
    {
      value: "OWNER",
      label: "Chủ cửa hàng",
      color: "bg-red-100 text-red-700",
    },
    {
      value: "ADMIN_SYSTEM",
      label: "Admin Hệ Thống",
      color: "bg-orange-100 text-red-700",
    },
    {
      value: "MANAGER",
      label: "Quản Lý",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "WAREHOUSE_STAFF",
      label: "Thủ Kho",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "SALESPERSON",
      label: "SALESPERSON",
      color: "bg-green-100 text-green-700",
    },
    { value: "STAFF", label: "Nhân viên", color: "bg-gray-100 text-gray-700" },
  ];

  // 1. Fetch Data
  const fetchEmployees = async () => {
    try {
      const [empData, locData] = await Promise.all([
        getEmployees(),
        getMyLocations(), // Lấy danh sách kho
      ]);
      setEmployees(empData);
      setLocations(locData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. Logic Mời (Truyền xuống InviteModal)
  const handleInvite = async (inviteData) => {
    try {
      await inviteEmployee(inviteData);
      alert(`Đã gửi lời mời tới ${inviteData.email}`);
      setShowInviteModal(false);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gửi lời mời");
    }
  };

  // 3. Logic Sửa Role (Truyền xuống EditRoleModal)
  const handleUpdateRole = async (id, newRole) => {
    try {
      await updateEmployeeRole(id, newRole);
      // Cập nhật UI ngay lập tức
      setEmployees(
        employees.map((emp) =>
          emp.id === id ? { ...emp, role: newRole } : emp,
        ),
      );
      alert("Cập nhật thành công!");
      setShowEditModal(false);
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || "Lỗi server"));
    }
  };

  // 4. Logic Xóa
  const handleDelete = async (id, email) => {
    if (!window.confirm(`Xóa nhân viên ${email}?`)) return;
    try {
      await deleteEmployee(id);
      setEmployees(employees.filter((e) => e.id !== id));
      alert("Đã xóa!");
    } catch (error) {
      alert("Không thể xóa nhân viên này.");
    }
  };

  // Mở modal edit
  // [CẬP NHẬT] Xử lý Save từ Modal Edit
  const handleUpdateRoleAndLocs = async (id, newRole, newLocIds) => {
    try {
      // 1. Cập nhật Role
      await updateEmployeeRole(id, newRole);
      // 2. Cập nhật Kho
      await assignUserLocations(id, newLocIds);

      // 3. Cập nhật UI (Local Update để đỡ phải fetch lại)
      // Tìm tên các kho vừa chọn để hiển thị ngay
      const selectedLocsObjects = locations
        .filter((l) => newLocIds.includes(l.id))
        .map((l) => ({ id: l.id, name: l.name }));

      setEmployees(
        employees.map((emp) =>
          emp.id === id
            ? { ...emp, role: newRole, assignedLocations: selectedLocsObjects }
            : emp,
        ),
      );

      alert("Cập nhật thành công!");
      setShowEditModal(false);
    } catch (error) {
      alert("Lỗi cập nhật: " + (error.response?.data?.message || "Lỗi server"));
    }
  };

  const getRoleBadge = (roleCode) => {
    const r = ROLES.find((item) => item.value === roleCode);
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${r?.color || "bg-gray-100"}`}
      >
        {r?.label || roleCode}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý nhân viên
          </h1>
          <p className="text-sm text-gray-500">Danh sách nhân sự hệ thống</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none w-64"
            />
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:bg-blue-700"
          >
            <FaUserPlus /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4 text-center">Vai trò</th>
              <th className="px-6 py-4">Kho phụ trách</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-blue-50/50">
                <td className="px-6 py-4 font-medium">{emp.fullName}</td>
                <td className="px-6 py-4 text-gray-500">{emp.username}</td>
                <td className="px-6 py-4 text-center">
                  {getRoleBadge(emp.role)}
                </td>
                {/* Hiển thị danh sách kho */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {emp.assignedLocations &&
                    emp.assignedLocations.length > 0 ? (
                      emp.assignedLocations.map((loc) => (
                        <span
                          key={loc.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] border border-gray-200"
                        >
                          <FaWarehouse size={8} /> {loc.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        Chưa gán kho
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${emp.isActive ? "text-green-600 bg-green-50" : "text-gray-500 bg-gray-100"}`}
                  >
                    {emp.isActive ? "Active" : "Locked"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 p-2 hover:bg-blue-50 rounded mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id, emp.email)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render Modals */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        roles={ROLES}
      />

      <EditRoleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateRoleAndLocs}
        initialData={selectedEmployee}
        roles={ROLES}
        locations={locations}
      />
    </div>
  );
};

export default EmployeePage;
