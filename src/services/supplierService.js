import api from "./api"; // Giả sử bạn đã có cấu hình axios instance

export const getSuppliers = async (locationId = '') => {
  const query = locationId ? `?locationId=${locationId}` : '';
  const response = await api.get(`/suppliers${query}`);
  return response.data;
};

export const createSupplier = async (data) => {
  const response = await api.post("/suppliers", data);
  return response.data;
};

export const updateSupplier = async (id, data) => {
  const response = await api.patch(`/suppliers/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};
