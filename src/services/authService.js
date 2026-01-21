const API_URL = process.env.REACT_APP_API_URL;

console.log("Check API URL:", API_URL); // Kiểm tra xem đã nhận chưa

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Ném lỗi về component để xử lý hiển thị
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
