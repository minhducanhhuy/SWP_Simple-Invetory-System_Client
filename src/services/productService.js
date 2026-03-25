// src/services/productService.js
import api from "./api";

// 1. Lấy danh sách sản phẩm
export const getProducts = async (params = {}) => {
  // [SỬA LẠI]: Destructure thêm minPrice, maxPrice, sortPrice
  const { search, categoryId, locationId, minPrice, maxPrice, sortPrice } =
    params;

  const config = {
    // [SỬA LẠI]: Truyền thêm các tham số này vào params của Axios
    params: { search, categoryId, minPrice, maxPrice, sortPrice },
    headers: { "x-location-id": locationId },
  };

  const response = await api.get("/products", config);
  return response.data;
};

// 2. Lấy Metadata (SỬA LẠI ĐOẠN NÀY)
// Gọi song song 2 API từ MasterDataModule
export const getProductMetadata = async () => {
  try {
    const [categoriesRes, unitsRes, suppliersRes] = await Promise.all([
      api.get("/master-data/categories"),
      api.get("/master-data/units"),
      api.get("/suppliers"),
    ]);

    return {
      categories: categoriesRes.data,
      units: unitsRes.data,
      suppliers: suppliersRes.data,
    };
  } catch (error) {
    console.error("Lỗi lấy metadata:", error);
    return { categories: [], units: [], suppliers: [] };
  }
};

// 3. Các hàm CRUD Sản phẩm (Giữ nguyên logic gửi header)
export const createProduct = async (data, locationId) => {
  // Giải thích: 'data' ở đây chính là object formData từ Modal gửi lên
  // Nó đã chứa: { name, sku, categoryId, unitId, supplierIds, ... }

  const response = await api.post("/products", data, {
    headers: {
      "x-location-id": locationId,
    },
  });

  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// [MỚI] Lấy thẻ kho
export const getProductHistory = async (productId) => {
  const response = await api.get(`/products/${productId}/history`);
  return response.data;
};
