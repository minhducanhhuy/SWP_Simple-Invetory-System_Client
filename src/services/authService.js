// src/services/authService.js
import api from "./api"; // Import cái instance vừa tạo

export const loginUser = async (credentials) => {
  try {
    // Không cần credentials: "include" nữa vì api.js đã lo rồi
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/users/me"); // Hoặc /users/me
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acceptInvite = async (data) => {
  // data gồm: { token, username, password, fullName, phone }
  const response = await api.post("/auth/accept-invite", data);

  return response.data;
};
