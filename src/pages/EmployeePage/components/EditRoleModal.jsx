// src/pages/Employee/components/EditRoleModal.jsx
import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaWarehouse,
  FaCheckSquare,
  FaRegSquare,
} from "react-icons/fa";

const EditRoleModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  roles,
  locations,
}) => {
  const [role, setRole] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fill dữ liệu khi mở modal
  useEffect(() => {
    if (initialData) {
      setRole(initialData.role);
      // Lấy danh sách ID các kho đã được gán trước đó
      const currentLocIds =
        initialData.assignedLocations?.map((l) => l.id) || [];
      setSelectedLocationIds(currentLocIds);
      setIsActive(initialData.isActive ?? true);
    }
  }, [initialData]);

  if (!isOpen || !initialData) return null;

  // Xử lý chọn/bỏ chọn kho
  const toggleLocation = (locId) => {
    if (selectedLocationIds.includes(locId)) {
      setSelectedLocationIds(selectedLocationIds.filter((id) => id !== locId));
    } else {
      setSelectedLocationIds([...selectedLocationIds, locId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Gọi hàm save truyền role và danh sách kho mới
    await onSave(initialData.id, role, selectedLocationIds, isActive);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-orange-500 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Phân quyền & Gán kho</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-sm text-gray-600 border-b border-gray-100 pb-4">
            Nhân viên:{" "}
            <span className="font-bold text-gray-900 text-lg ml-2">
              {initialData.fullName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT 1: CHỌN ROLE */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                1. Vai trò
              </label>
              <div className="space-y-2">
                {roles.map((r) => (
                  <div
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`cursor-pointer border rounded-lg p-3 flex justify-between items-center transition-all ${
                      role === r.value
                        ? "border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-sm"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xs">{r.label}</span>
                    {role === r.value && (
                      <span className="text-orange-600">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT 2: CHỌN KHO (Chỉ hiện nếu không phải Admin/Owner - tùy logic) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaWarehouse /> 2. Được phép truy cập
              </label>
              <div className="border border-gray-200 rounded-lg p-2 max-h-60 overflow-y-auto bg-gray-50">
                {locations.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Chưa có kho nào
                  </p>
                ) : (
                  locations.map((loc) => {
                    const isSelected = selectedLocationIds.includes(loc.id);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => toggleLocation(loc.id)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer mb-1 transition-colors ${
                          isSelected
                            ? "bg-blue-100 text-blue-800"
                            : "hover:bg-white"
                        }`}
                      >
                        {isSelected ? (
                          <FaCheckSquare className="text-blue-600" />
                        ) : (
                          <FaRegSquare className="text-gray-400" />
                        )}
                        <span className="text-xs font-medium truncate">
                          {loc.name}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic">
                * Nhân viên chỉ xem được tồn kho và tạo phiếu tại các kho được
                chọn.
              </p>
            </div>

            {/* [MỚI] THÊM PHẦN CHỈNH SỬA TRẠNG THÁI */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Trạng thái hoạt động
                </label>
                <p className="text-[10px] text-gray-500 italic">
                  * Nếu tắt, nhân viên sẽ không thể đăng nhập vào hệ thống.
                </p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 cursor-pointer"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-lg flex items-center gap-2 font-bold"
            >
              {submitting && <FaSpinner className="animate-spin" />} Lưu thay
              đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;
