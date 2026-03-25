import api from "./api";

export const getCashTransactions = async (locationId) => {
  if (!locationId) return [];
  const response = await api.get(`/cash-transactions?locationId=${locationId}`);
  return response.data;
};

export const createCashTransaction = async (data) => {
  const response = await api.post("/cash-transactions", data);
  return response.data;
};
