import api from "./api";

// Lấy danh sách phiếu
export const getStockTickets = async () => {
  const response = await api.get("/stock-tickets");
  console.log(response.data);
  return response.data;
};

// Tạo phiếu mới (Payload phải khớp với CreateStockTicketDto)
export const createStockTicket = async (ticketData) => {
  // ticketData bao gồm: type, note, sourceLocationId, destLocationId, details: []
  const response = await api.post("/stock-tickets", ticketData);

  return response.data;
};

export const getStockTicketDetail = async (id) => {
  const response = await api.get(`/stock-tickets/${id}`);
  return response.data;
};

export const approveStockTicket = async (id) => {
  const response = await api.patch(`/stock-tickets/${id}/approve`);
  return response.data;
};
export const cancelStockTicket = async (id, reason) => {
  const response = await api.patch(`/stock-tickets/${id}/cancel`, {
    reason,
  });
  return response.data;
};

// Xác nhận nhận hàng luân chuyển (Kho đích bấm)
// BẮT BUỘC PHẢI THÊM locationId VÀO TRONG NGOẶC (...)
export const receiveTransfer = async (id, actualDetails = [], locationId) => {
  const response = await api.patch(`/stock-tickets/${id}/receive`, {
    actualDetails,
    locationId, // <--- ĐẨY locationId XUỐNG CHO BACKEND NHẬN DIỆN
  });
  return response.data;
};
