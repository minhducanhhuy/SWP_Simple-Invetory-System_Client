import api from "./api";

// ================= DANH MỤC (CATEGORIES) =================
export const getCategories = async () => {
  const response = await api.get("/master-data/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/master-data/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.patch(`/master-data/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/master-data/categories/${id}`);
  return response.data;
};

// ================= ĐƠN VỊ TÍNH (UNITS) =================
export const getUnits = async () => {
  const response = await api.get("/master-data/units");
  return response.data;
};

export const createUnit = async (data) => {
  const response = await api.post("/master-data/units", data);
  return response.data;
};

export const updateUnit = async (id, data) => {
  const response = await api.patch(`/master-data/units/${id}`, data);
  return response.data;
};

export const deleteUnit = async (id) => {
  const response = await api.delete(`/master-data/units/${id}`);
  return response.data;
};

export const syncCategories = async (data) => {
  const response = await api.post("/master-data/categories/sync", data);
  return response.data;
};

export const syncUnits = async (data) => {
  const response = await api.post("/master-data/units/sync", data);
  return response.data;
};
