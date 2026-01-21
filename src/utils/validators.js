/**
 * Kiểm tra tính hợp lệ của mật khẩu
 * Rule: Min 6 chars, 1 hoa, 1 thường, 1 đặc biệt/số
 */
export const validatePassword = (password) => {
  const regex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  return password && password.length >= 6 && regex.test(password);
};

/**
 * Kiểm tra tính hợp lệ của username
 * Rule: Min 5 chars, chỉ chữ và số (tùy chỉnh theo nghiệp vụ)
 */
export const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9]+$/;
  return username && username.length >= 5 && regex.test(username);
};
