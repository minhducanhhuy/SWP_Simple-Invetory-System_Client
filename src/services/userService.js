import api from "./api";

// [MỚI] User tự đổi thông tin
export const updateUserProfile = async (data) => {
  const response = await api.patch("/users/profile", data);
  return response.data;
};
