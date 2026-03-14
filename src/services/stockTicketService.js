import api from "./api";

// Lấy danh sách phiếu
export const getStockTickets = async () => {
  const response = await api.get("/stock-tickets");
  return response.data;
};

// Lấy chi tiết 1 phiếu
export const getStockTicketById = async (id) => {
  const response = await api.get(`/stock-tickets/${id}`);
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
