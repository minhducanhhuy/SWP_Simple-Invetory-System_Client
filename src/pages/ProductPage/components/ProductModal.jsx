import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaBoxOpen,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";

const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing,
  categories,
  units,
  suppliers,
}) => {
  const [formData, setFormData] = useState({
    ...initialData,
    supplierIds: initialData?.supplierIds || [],
  });

  const handleSupplierChange = (supplierId) => {
    setFormData((prev) => {
      const currentIds = prev.supplierIds || [];
      const isExist = currentIds.includes(supplierId);

      return {
        ...prev,
        supplierIds: isExist
          ? currentIds.filter((id) => id !== supplierId)
          : [...currentIds, supplierId],
      };
    });
  };

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "sku" ? value.trimStart() : value;
    setFormData({ ...formData, [name]: newValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sku.trim()) newErrors.sku = "SKU bắt buộc";
    if (!formData.name.trim()) newErrors.name = "Tên bắt buộc";
    if (!formData.categoryId) newErrors.categoryId = "Chọn danh mục";
    if (!formData.unitId) newErrors.unitId = "Chọn ĐVT";

    // [THÊM LOGIC] Kiểm tra Giá Bán phải lớn hơn Giá Vốn
    const cost = Number(formData.costPrice || 0);
    const sell = Number(formData.sellPrice || 0);

    if (sell <= cost) {
      newErrors.sellPrice = "Giá bán phải lớn hơn giá vốn!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const inputStyle = (hasError) =>
    `w-full rounded-lg border ${
      hasError
        ? "border-red-500 text-red-900 focus:ring-red-100"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
    } bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 p-4 backdrop-blur-sm transition-all">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl scale-100 transform rounded-2xl bg-white shadow-2xl transition-all md:h-auto h-full md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* SKU */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mã SKU <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="sku"
                  placeholder="VD: SP001"
                  className={inputStyle(errors.sku)}
                  value={formData.sku}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  title={isEditing ? "Không thể sửa SKU" : ""}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <FaBoxOpen className="h-4 w-4" />
                </div>
              </div>
              {errors.sku && (
                <p className="mt-1 text-xs text-red-500">{errors.sku}</p>
              )}
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={inputStyle(errors.name)}
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                className={inputStyle(errors.categoryId)}
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Đơn vị tính <span className="text-red-500">*</span>
              </label>
              <select
                name="unitId"
                className={inputStyle(errors.unitId)}
                value={formData.unitId}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn ĐVT --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {errors.unitId && (
                <p className="mt-1 text-xs text-red-500">{errors.unitId}</p>
              )}
            </div>

            {/* Price Inputs */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Giá Vốn
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="costPrice"
                  className={`${inputStyle(false)} pl-9`}
                  value={formData.costPrice}
                  onChange={handleInputChange}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaDollarSign className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* GIÁ BÁN - ĐÃ CẬP NHẬT GIAO DIỆN HIỂN THỊ LỖI */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Giá Bán <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="sellPrice"
                  className={`${inputStyle(errors.sellPrice)} pl-9 font-semibold ${errors.sellPrice ? "" : "text-blue-600"}`}
                  value={formData.sellPrice}
                  onChange={handleInputChange}
                />
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${errors.sellPrice ? "text-red-500" : "text-blue-500"}`}
                >
                  <FaDollarSign className="h-4 w-4" />
                </div>
              </div>
              {errors.sellPrice && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.sellPrice}
                </p>
              )}
            </div>

            {/*Description*/}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Mô tả sản phẩm
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className={inputStyle(false)}
                placeholder="Nhập mô tả sản phẩm..."
              />
            </div>

            {/* Cột hiển thị Nhà cung cấp */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nhà cung cấp (Có thể chọn nhiều)
              </label>

              {/* Khu vực 1: Hiển thị các Tags đã chọn */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[32px] items-center p-2 bg-white border border-gray-200 rounded-lg">
                {formData.supplierIds?.map((id) => {
                  const supplier = suppliers?.find((s) => s.id === id);

                  if (!supplier) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 shadow-sm"
                    >
                      {supplier.name}
                      <button
                        type="button"
                        onClick={() => handleSupplierChange(id)}
                        className="hover:text-red-600 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        title="Bỏ chọn"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  );
                })}
                {(!formData.supplierIds ||
                  formData.supplierIds.length === 0) && (
                  <span className="text-sm text-gray-400 italic px-2">
                    Chưa chọn nhà cung cấp nào...
                  </span>
                )}
              </div>

              {/* Khu vực 2: Danh sách Checkbox */}
              <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-48 overflow-y-auto shadow-inner">
                {suppliers?.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-md transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.supplierIds?.includes(s.id) || false}
                      onChange={() => handleSupplierChange(s.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {s.name}
                      </span>
                      <span className="text-xs text-gray-500">{s.code}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                URL Hình ảnh
              </label>
              <input
                type="text"
                name="imageUrl"
                className={inputStyle(false)}
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
            </div>

            {/* Warning Box */}
            <div className="md:col-span-2 mt-2 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <FaExclamationTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">
                  Cấu hình cảnh báo
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Báo đỏ khi tồn kho thấp hơn mức này.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Mức min:
                  </label>
                  <input
                    type="number"
                    name="minStockLevel"
                    className="w-24 rounded-lg border border-amber-300 bg-white px-3 py-2 text-center text-lg font-bold text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            {isEditing ? "Cập Nhật" : "Lưu Sản Phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
