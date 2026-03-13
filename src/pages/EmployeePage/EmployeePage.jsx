import React, { useState, useEffect, useMemo } from "react";
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
  updateEmployeeStatus,
} from "../../services/employeeService";

// Import các component con
import InviteUserModal from "./components/InviteUserModal";
import EditRoleModal from "./components/EditRoleModal";
import { getMyLocations } from "../../services/locationService";

const EmployeePage = () => {
  // States cho dữ liệu
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho Filter
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

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

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return employees.filter((emp) => {
      const matchesName = emp.fullName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesRole = roleFilter === "" || emp.role === roleFilter;

      const matchesLocation =
        locationFilter === "" ||
        emp.assignedLocations?.some((loc) => loc.id === locationFilter);

      return matchesName && matchesRole && matchesLocation;
    });
  }, [employees, search, roleFilter, locationFilter]);

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
  const handleUpdateRoleAndLocs = async (
    id,
    newRole,
    newLocIds,
    newIsActive,
  ) => {
    try {
      // 1. Cập nhật Role
      await updateEmployeeRole(id, newRole);
      // 2. Cập nhật Kho
      await assignUserLocations(id, newLocIds);
      // 3. [MỚI] Cập nhật Trạng thái
      await updateEmployeeStatus(id, newIsActive);

      // Tìm tên các kho vừa chọn để hiển thị ngay
      const selectedLocsObjects = locations
        .filter((l) => newLocIds.includes(l.id))
        .map((l) => ({ id: l.id, name: l.name }));

      // 4. Cập nhật UI ngay lập tức
      setEmployees(
        employees.map((emp) =>
          emp.id === id
            ? {
                ...emp,
                role: newRole,
                assignedLocations: selectedLocsObjects,
                isActive: newIsActive, // [MỚI] Cập nhật trạng thái trong state
              }
            : emp,
        ),
      );

      alert("Cập nhật thông tin nhân viên thành công!");
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
              placeholder="Tìm kiếm theo Họ Tên..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Lọc theo Vai trò */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white focus:border-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Lọc theo Kho */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white focus:border-blue-500"
          >
            <option value="">Tất cả kho</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
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
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {emp.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{emp.username}</td>
                    <td className="px-6 py-4 text-center">
                      {getRoleBadge(emp.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.assignedLocations?.length > 0 ? (
                          emp.assignedLocations.map((loc) => (
                            <span
                              key={loc.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] border border-blue-100"
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
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          emp.isActive
                            ? "text-green-600 bg-green-50"
                            : "text-gray-400 bg-gray-100"
                        }`}
                      >
                        {emp.isActive ? "Hoạt Động" : "Vô Hiệu Hóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 p-2 hover:bg-blue-100 rounded-lg transition-colors mr-1"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.username)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
