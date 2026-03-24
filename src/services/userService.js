import api from "./api";

// [MỚI] User tự đổi thông tin
export const updateUserProfile = async (data) => {
  const response = await api.patch("/users/profile", data);
  return response.data;
};

// [MỚI] Đổi mật khẩu
export const changePassword = async (data) => {
  // data: { oldPassword, newPassword }
  const response = await api.patch("/users/change-password", data);
  return response.data;
};
