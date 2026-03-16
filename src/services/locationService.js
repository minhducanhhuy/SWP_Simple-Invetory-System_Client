// src/services/locationService.js
import api from "./api";

export const getMyLocations = async () => {
  try {
    // API này sẽ trả về danh sách kho dựa trên req.user ở Backend
    const response = await api.get("/locations");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kho:", error);
    throw error;
  }
};

// 2. Tạo kho mới
export const createLocation = async (data) => {
  // data: { code, name, address }
  const response = await api.post("/locations", data);
  return response.data;
};

// 3. Cập nhật thông tin kho
export const updateLocation = async (id, data) => {
  const response = await api.patch(`/locations/${id}`, data);
  return response.data;
};

// 4. (Optional) Lấy chi tiết 1 kho
export const getLocationDetail = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

export const getAllActiveLocations = async () => {
  const res = await api.get("/locations/all-active");
  return res.data;
};
