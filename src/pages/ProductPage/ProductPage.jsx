// src/pages/ProductPage.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import ProductHeader from "./components/ProductHeader";
import ProductToolbar from "./components/ProductToolbar";
import ProductTable from "./components/ProductTable";
import ProductModal from "./components/ProductModal";
import { useSearchParams } from "react-router-dom";
// Import Service và Context
import {
  getProducts,
  getProductMetadata,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import { useLocation } from "../../context/LocationContext";
import StockCardModal from "./components/StockCardModal";
import { AuthContext } from "../../context/AuthContext";

const ProductPage = () => {
  const [params] = useSearchParams();

  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const sortPrice = params.get("sortPrice");
  const { user } = useContext(AuthContext); // Lấy thông tin user
  const isSalesperson = user?.role === "SALESPERSON"; // Biến kiểm tra quyền

  // 1. State quản lý dữ liệu
  const { currentLocation } = useLocation(); // Lấy kho hiện tại từ Header
  const [products, setProducts] = useState([]);
  const [historyProductId, setHistoryProductId] = useState(null); // State lưu ID sp đang xem lịch sử
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // State mở modal

  const [metadata, setMetadata] = useState({
    categories: [],
    units: [],
    suppliers: [],
  });

  // 2. State quản lý UI/Filter
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    sku: "",
    name: "",
    categoryId: "",
    unitId: "",
    supplierId: "",
    costPrice: 0,
    sellPrice: 0,
    imageUrl: "",
    description: "",
    minStockLevel: 10,
  };
  const [modalData, setModalData] = useState(initialFormState);

  // --- KHỐI 1: FETCH DỮ LIỆU ---

  // Gọi 1 lần khi vào trang: Lấy danh mục & ĐVT
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await getProductMetadata();

        setMetadata(data);
      } catch (error) {
        console.error("Lỗi tải metadata:", error);
      }
    };
    fetchMeta();
  }, []);

  // Gọi mỗi khi: Đổi kho (Header), Search, hoặc Filter
  useEffect(() => {
    // 1. Tạo một timer để hoãn việc gọi API (Debounce)
    const timer = setTimeout(async () => {
      // Nếu chưa có thông tin kho thì không làm gì cả
      if (!currentLocation) return;

      setLoading(true);
      try {
        // 2. Gọi API với đầy đủ các bộ lọc
        const data = await getProducts({
          search: searchTerm,
          categoryId: categoryFilter,
          locationId: currentLocation.id,
          minPrice: minPrice,
          maxPrice: maxPrice,
          sortPrice: sortPrice,
        });

        // 3. Cập nhật dữ liệu vào state
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    }, 400); // Đợi 400ms sau khi người dùng ngừng thao tác mới gọi API

    // 4. Cleanup function: Xóa timer cũ nếu người dùng thao tác tiếp
    return () => clearTimeout(timer);

    // Danh sách các biến cần theo dõi: hễ một trong các biến này đổi là chạy lại useEffect
  }, [
    currentLocation,
    searchTerm,
    categoryFilter,
    minPrice,
    maxPrice,
    sortPrice,
  ]);

  // --- KHỐI 2: HANDLERS (XỬ LÝ SỰ KIỆN) ---

  const handleSave = async (formData) => {
    try {
      // Format dữ liệu số trước khi gửi
      const payload = {
        ...formData,
        costPrice: Number(formData.costPrice),
        sellPrice: Number(formData.sellPrice),
        minStockLevel: Number(formData.minStockLevel),
      };

      if (isEditing) {
        await updateProduct(formData.id, payload);
        alert("Cập nhật thành công!");
      } else {
        // Khi tạo mới, gửi kèm locationId để nhập tồn đầu kỳ (nếu có)
        await createProduct(payload, currentLocation?.id);
        alert("Thêm mới thành công!");
      }

      // Refresh lại list sau khi lưu
      setIsModalOpen(false);
      // Trigger fetch lại bằng cách trick nhẹ hoặc tách hàm fetch ra
      const updatedList = await getProducts({
        search: searchTerm,
        categoryId: categoryFilter,
        locationId: currentLocation?.id,
      });
      setProducts(updatedList);
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
      )
    )
      return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Không thể xóa sản phẩm này.");
    }
  };

  const handleOpenAdd = () => {
    setModalData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    // 1. Chế biến dữ liệu thô từ Table thành dữ liệu chuẩn cho Form Modal
    const formattedData = {
      ...product,

      // Chuyển đổi Quan hệ Nhiều-Nhiều:
      // Từ [{supplierId: 'A'}, {supplierId: 'B'}] thành ['A', 'B']
      supplierIds: product.suppliers?.map((item) => item.supplierId) || [],

      // Ép kiểu dữ liệu số để các ô Input không bị lỗi hoặc hiện trống
      costPrice: product.costPrice ? Number(product.costPrice) : 0,
      sellPrice: product.sellPrice ? Number(product.sellPrice) : 0,
      minStockLevel: product.minStockLevel ? Number(product.minStockLevel) : 10,

      // Giữ lại các trường khác (sku, name, categoryId, unitId...)
    };

    // 2. Cập nhật vào State để Modal "nhìn thấy" dữ liệu này
    setModalData(formattedData);

    // 3. Kích hoạt trạng thái Sửa và mở Modal
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Hàm mở thẻ kho
  const handleOpenHistory = (productId) => {
    setHistoryProductId(productId);
    setIsHistoryOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <ProductHeader />

      <ProductToolbar
        onOpenModal={handleOpenAdd}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={metadata?.categories || []} // Truyền danh mục thật
        isSalesperson={isSalesperson}
      />

      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : (
        <ProductTable
          products={products}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onHistory={handleOpenHistory}
          isSalesperson={isSalesperson}
        />
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={modalData}
        isEditing={isEditing}
        categories={metadata.categories}
        units={metadata.units}
        suppliers={metadata.suppliers} // <--- DÒNG NÀY ĐỂ TRUYỀN XUỐNG MODAL
      />

      {/* Modal Thẻ Kh */}
      <StockCardModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        productId={historyProductId}
      />
    </div>
  );
};

export default ProductPage;
