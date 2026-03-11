import api from "./api";

// Lấy danh sách phiếu chi (nếu cần trang danh sách riêng)
export const getSupplierPayments = async () => {
  const response = await api.get("/supplier-payments");
  return response.data;
};

// Tạo phiếu chi mới
export const createSupplierPayment = async (paymentData) => {
  // paymentData: { supplierId, amount, note }
  const response = await api.post("/supplier-payments", paymentData);
  return response.data;
};

export const deleteSupplierPayment = async (id) => {
  const response = await api.delete(`/supplier-payments/${id}`);
  return response.data;
};
