// src/services/employeeService.js
import api from "./api"; // Giả sử bạn đã có file cấu hình axios instance

// 1. Lấy danh sách nhân viên
export const getEmployees = async () => {
  const response = await api.get("/users");
  return response.data;
};

// 2. Gửi lời mời nhân viên (Sử dụng API Invite của AuthController)
// Payload: { email: "...", role: "..." }
export const inviteEmployee = async (data) => {
  const response = await api.post("/auth/invite", data);
  return response.data;
};

// [MỚI] Admin đổi role
export const updateEmployeeRole = async (id, role) => {
  // Body gửi lên: { role: "..." }
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
};

// [MỚI] Gán kho cho nhân viên
export const assignUserLocations = async (userId, locationIds) => {
  // locationIds là mảng: ["uuid-1", "uuid-2"]
  const response = await api.patch(`/users/${userId}/locations`, {
    locationIds,
  });
  return response.data;
};

// 4. Xóa nhân viên
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
