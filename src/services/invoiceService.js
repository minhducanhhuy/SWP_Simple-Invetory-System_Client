// src/services/invoiceService.js
import api from "./api";

// Tạo hóa đơn mới (Kéo theo trừ kho tự động)
export const createInvoice = async (invoiceData) => {
  const response = await api.post("/invoices", invoiceData);
  return response.data;
};

// Lấy danh sách hóa đơn theo chi nhánh (Để xem lịch sử giao ca)
export const getInvoicesByLocation = async (locationId) => {
  if (!locationId) return [];
  const response = await api.get(`/invoices?locationId=${locationId}`);
  return response.data;
};

export const getDashboardSummary = async (locationId) => {
  if (!locationId) return null;
  const response = await api.get(
    `/invoices/dashboard?locationId=${locationId}`,
  );
  return response.data;
};
