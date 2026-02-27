/**
 * Kiểm tra tính hợp lệ của mật khẩu
 * Rule: Min 6 chars, 1 hoa, 1 thường, 1 đặc biệt/số
 */
export const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  return !!password && regex.test(password);
};

/**
 * Kiểm tra tính hợp lệ của username
 * Rule: Min 5 chars, chỉ chữ và số (tùy chỉnh theo nghiệp vụ)
 */
export const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return username && username.length >= 5 && regex.test(username);
};
