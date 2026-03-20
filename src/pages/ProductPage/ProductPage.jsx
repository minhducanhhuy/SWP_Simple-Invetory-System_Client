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

  const [metadata, setMetadata] = useState({ categories: [], units: [] });

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
    const fetchData = async () => {
      if (!currentLocation) return;
      setLoading(true);
      try {
        const data = await getProducts({
          search: searchTerm,
          categoryId: categoryFilter,
          locationId: currentLocation.id,
          minPrice,
  maxPrice,
  sortPrice, // Truyền ID kho để lấy tồn kho tương ứng
        });
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce nhẹ cho search để tránh gọi API liên tục
    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentLocation, searchTerm, categoryFilter, minPrice, maxPrice, sortPrice]);

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
    // Map dữ liệu từ row vào form
    setModalData({
      ...product,
      // Backend trả về currentStock, nhưng form không sửa stock trực tiếp ở đây (sẽ dùng phiếu nhập/xuất)
    });
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
        categories={metadata.categories} // Truyền danh mục thật
        units={metadata.units} // Truyền ĐVT thật
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
