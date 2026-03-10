import React, { useState, useEffect } from "react";
import {
  FaWarehouse,
  FaMapMarkerAlt,
  FaBarcode,
  FaSpinner,
} from "react-icons/fa";

const LocationModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fill dữ liệu nếu là chế độ Sửa
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        address: initialData.address || "",
        isActive: initialData.isActive ?? true,
      });
    } else {
      // Reset form nếu là chế độ Thêm mới
      setFormData({ code: "", name: "", address: "", isActive: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave(formData);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FaWarehouse /> {isEditing ? "Cập nhật Kho" : "Thêm Kho Mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mã kho */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mã kho (Code)
            </label>
            <div className="relative">
              <FaBarcode className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                disabled={isEditing} // Không cho sửa mã kho
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${isEditing ? "bg-gray-100 text-gray-500" : "border-gray-300"}`}
                placeholder="VD: KHO-HN01"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            {isEditing && (
              <p className="text-xs text-gray-400 mt-1">
                * Mã kho không thể thay đổi.
              </p>
            )}
          </div>

          {/* Tên kho */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tên kho
            </label>
            <div className="relative">
              <FaWarehouse className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="VD: Kho Tổng Hà Nội"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Địa chỉ
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="VD: 123 Đường Láng, Hà Nội"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          {/* [MỚI] Trạng thái hoạt động - Chỉ hiển thị khi đang Sửa */}
          {isEditing && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                id="isActive"
                type="checkbox"
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <label
                htmlFor="isActive"
                className="text-sm font-bold text-gray-700 cursor-pointer select-none"
              >
                Trạng thái hoạt động (Active)
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-lg flex items-center gap-2 font-bold transition-transform active:scale-95"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              {isEditing ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
