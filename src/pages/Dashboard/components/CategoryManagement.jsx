// src/pages/Dashboard/components/CategoryManagement.jsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSpinner } from "react-icons/fa";
// Import các hàm API tương ứng
import {
  getCategories,
  createCategory,
  deleteCategory,
  getUnits,
  createUnit,
  deleteUnit,
} from "../../../services/masterDataService";

const CategoryManagement = ({ type, title }) => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(false);

  // Xác định hàm API cần dùng dựa trên props `type`
  const isCategory = type === "CATEGORY";
  const fetchAPI = isCategory ? getCategories : getUnits;
  const createAPI = isCategory ? createCategory : createUnit;
  const deleteAPI = isCategory ? deleteCategory : deleteUnit;
  const placeholder = isCategory
    ? "Tên danh mục (VD: Đồ uống)"
    : "Tên ĐVT (VD: Chai, Lon)";

  const loadData = async () => {
    try {
      const data = await fetchAPI();
      setItems(data || []);
    } catch (error) {
      console.error("Load data error", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!newItemName.trim()) return;
    setLoading(true);
    try {
      await createAPI({ name: newItemName });
      setNewItemName("");
      await loadData(); // Reload list
    } catch (error) {
      alert("Lỗi khi thêm mới!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await deleteAPI(id);
      await loadData();
    } catch (error) {
      alert("Không thể xóa (có thể đang được sử dụng)");
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-lg">
        <span className={isCategory ? "text-yellow-500" : "text-green-500"}>
          {isCategory ? "📂" : "⚖️"}
        </span>
        {title}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 pr-2 custom-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-gray-700">{item.name}</span>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-gray-300 group-hover:text-red-500 transition-colors"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            Chưa có dữ liệu
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
