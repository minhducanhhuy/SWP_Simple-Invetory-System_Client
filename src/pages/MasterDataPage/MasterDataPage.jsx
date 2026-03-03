// src/pages/MasterDataPage.jsx
import React, { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../../services/masterDataService"; // <--- Import service mới
import { FaTrash, FaPlus, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const MasterDataPage = () => {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  // State thêm mới
  const [newCat, setNewCat] = useState("");
  const [newUnit, setNewUnit] = useState("");

  // State chỉnh sửa (lưu ID của item đang sửa)
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");

  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editingUnitName, setEditingUnitName] = useState("");

  // --- 1. LOAD DỮ LIỆU ---
  const fetchData = async () => {
    try {
      const [catData, unitData] = await Promise.all([
        getCategories(),
        getUnits(),
      ]);
      setCategories(catData);
      setUnits(unitData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. XỬ LÝ DANH MỤC (CATEGORY) ---
  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await createCategory({ name: newCat }); // Gọi service
      setNewCat("");
      fetchData();
    } catch (err) {
      alert(
        "Lỗi thêm danh mục: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCatName.trim()) return;
    try {
      await updateCategory(id, { name: editingCatName }); // Gọi service
      setEditingCatId(null);
      fetchData();
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      await deleteCategory(id); // Gọi service
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa (đang được sử dụng)");
    }
  };

  // --- 3. XỬ LÝ ĐƠN VỊ TÍNH (UNIT) ---
  const handleAddUnit = async () => {
    if (!newUnit.trim()) return;
    try {
      await createUnit({ name: newUnit }); // Gọi service
      setNewUnit("");
      fetchData();
    } catch (err) {
      alert("Đơn vị tính đã tồn tại hoặc lỗi server");
    }
  };

  const handleUpdateUnit = async (id) => {
    if (!editingUnitName.trim()) return;
    try {
      await updateUnit(id, { name: editingUnitName }); // Gọi service
      setEditingUnitId(null);
      fetchData();
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm("Xóa đơn vị tính này?")) return;
    try {
      await deleteUnit(id); // Gọi service
      setUnits((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa (đang được sử dụng)");
    }
  };

  // --- RENDER ITEM (Tái sử dụng cho cả 2 list) ---
  const renderItem = (
    item,
    type,
    isEditing,
    editName,
    setEditName,
    onSave,
    onCancel,
    onEdit,
    onDelete,
  ) => (
    <li
      key={item.id}
      className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm group hover:border-blue-200 transition-all"
    >
      {isEditing ? (
        <div className="flex gap-2 flex-1 mr-2">
          <input
            className="border p-1 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => onSave(item.id)}
            className="text-green-600 hover:bg-green-50 p-1 rounded"
          >
            <FaSave />
          </button>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:bg-gray-100 p-1 rounded"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <>
          <span className="font-medium text-gray-700">{item.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
            >
              <FaTrash />
            </button>
          </div>
        </>
      )}
    </li>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      {/* KHỐI QUẢN LÝ DANH MỤC */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          📂 Quản lý Danh Mục
        </h2>
        <div className="flex gap-2 mb-6">
          <input
            className="border p-2.5 rounded-lg w-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            placeholder="Tên danh mục (VD: Đồ uống)"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <FaPlus />
          </button>
        </div>
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((c) =>
            renderItem(
              c,
              "cat",
              editingCatId === c.id,
              editingCatName,
              setEditingCatName,
              handleUpdateCategory,
              () => setEditingCatId(null),
              (item) => {
                setEditingCatId(item.id);
                setEditingCatName(item.name);
              },
              handleDeleteCategory,
            ),
          )}
        </ul>
      </div>

      {/* KHỐI QUẢN LÝ ĐƠN VỊ TÍNH */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          ⚖️ Quản lý Đơn Vị Tính
        </h2>
        <div className="flex gap-2 mb-6">
          <input
            className="border p-2.5 rounded-lg w-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all"
            placeholder="Tên ĐVT (VD: Chai, Lon)"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUnit()}
          />
          <button
            onClick={handleAddUnit}
            className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 shadow-sm"
          >
            <FaPlus />
          </button>
        </div>
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {units.map((u) =>
            renderItem(
              u,
              "unit",
              editingUnitId === u.id,
              editingUnitName,
              setEditingUnitName,
              handleUpdateUnit,
              () => setEditingUnitId(null),
              (item) => {
                setEditingUnitId(item.id);
                setEditingUnitName(item.name);
              },
              handleDeleteUnit,
            ),
          )}
        </ul>
      </div>
    </div>
  );
};

export default MasterDataPage;
