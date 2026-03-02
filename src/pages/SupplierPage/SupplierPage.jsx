import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/supplierService";

// --- COMPONENT: MODAL FORM (Giữ nguyên không đổi) ---
const SupplierModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.code || !formData.name)
      return alert("Vui lòng nhập Mã và Tên!");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {isEditing ? "Sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mã NCC <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border p-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="SUP001"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên NCC <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Công ty ABC..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Số điện thoại
              </label>
              <input
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Địa chỉ
            </label>
            <input
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nợ đầu kỳ (VNĐ)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-right"
                value={formData.initialDebt}
                onChange={(e) =>
                  setFormData({ ...formData, initialDebt: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            Lưu Lại
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const SupplierPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý bộ lọc & sắp xếp
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL | DEBT | CREDIT
  const [sortOption, setSortOption] = useState("NAME_ASC"); // NAME_ASC | NAME_DESC | DEBT_DESC | DEBT_ASC

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const initialForm = {
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    initialDebt: 0,
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        await updateSupplier(data.id, data);
        alert("Cập nhật thành công!");
      } else {
        await createSupplier({
          ...data,
          initialDebt: Number(data.initialDebt),
        });
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa nhà cung cấp này?")) return;
    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa (đang có giao dịch)");
    }
  };

  // --- LOGIC XỬ LÝ DỮ LIỆU (Filter & Sort) ---
  const processedSuppliers = useMemo(() => {
    let result = [...suppliers];

    // 1. Tìm kiếm (Search)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerTerm) ||
          s.code.toLowerCase().includes(lowerTerm) ||
          s.phone?.includes(lowerTerm) ||
          s.email?.includes(lowerTerm),
      );
    }

    // 2. Lọc theo trạng thái nợ (Filter)
    if (filterType === "DEBT") {
      result = result.filter((s) => Number(s.debt) > 0); // Chỉ hiện người mình đang nợ
    } else if (filterType === "CREDIT") {
      result = result.filter((s) => Number(s.debt) < 0); // Chỉ hiện người đang nợ mình
    }

    // 3. Sắp xếp (Sort)
    result.sort((a, b) => {
      switch (sortOption) {
        case "NAME_ASC":
          return a.name.localeCompare(b.name);
        case "NAME_DESC":
          return b.name.localeCompare(a.name);
        case "DEBT_DESC": // Nợ nhiều nhất lên đầu
          return Number(b.debt || 0) - Number(a.debt || 0);
        case "DEBT_ASC": // Nợ ít nhất (hoặc âm nhiều nhất) lên đầu
          return Number(a.debt || 0) - Number(b.debt || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [suppliers, searchTerm, filterType, sortOption]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nhà Cung Cấp</h1>
          <p className="text-sm text-gray-500">
            Quản lý danh sách và công nợ đối tác
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm"
        >
          <FaPlus /> Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* --- TOOLBAR: SEARCH - FILTER - SORT --- */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50/50">
          {/* 1. Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              placeholder="Tìm kiếm Mã, Tên, SĐT, Email, ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 2. Filter Dropdown */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 text-sm" />
            <select
              className="p-2 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="DEBT">Đang nợ tiền (Phải trả)</option>
              <option value="CREDIT">Đang dư tiền (Phải thu)</option>
            </select>
          </div>

          {/* 3. Sort Dropdown */}
          <div className="flex items-center gap-2">
            <FaSortAmountDown className="text-gray-400 text-sm" />
            <select
              className="p-2 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="NAME_ASC">Tên (A-Z)</option>
              <option value="NAME_DESC">Tên (Z-A)</option>
              <option value="DEBT_DESC">Nợ nhiều nhất</option>
              <option value="DEBT_ASC">Nợ ít nhất</option>
            </select>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Mã NCC</th>
                <th className="px-6 py-4">Thông tin cơ bản</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4 text-right">Công nợ hiện tại</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    Đang tải...
                  </td>
                </tr>
              ) : processedSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-400 italic"
                  >
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                processedSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {s.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{s.name}</div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                        <FaMapMarkerAlt />{" "}
                        <span className="truncate max-w-[200px]">
                          {s.address || "---"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <FaPhone className="text-xs" /> {s.phone || "---"}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-xs" /> {s.email || "---"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {(() => {
                        const debt = Number(s.debt || 0);
                        if (debt > 0) {
                          return (
                            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                              {debt.toLocaleString()} ₫
                            </span>
                          );
                        }
                        if (debt < 0) {
                          return (
                            <div className="flex flex-col items-end">
                              <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                                {Math.abs(debt).toLocaleString()} ₫
                              </span>
                              <span className="text-[10px] text-green-600 font-semibold uppercase mt-0.5">
                                (Dư)
                              </span>
                            </div>
                          );
                        }
                        return <span className="text-gray-400">0 ₫</span>;
                      })()}
                    </td>

                    {/* CỘT THAO TÁC */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/suppliers/${s.id}`)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Lịch sử & Thanh toán"
                        >
                          <FaFileInvoiceDollar />
                        </button>

                        <button
                          onClick={() => {
                            setEditingItem(s);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Sửa thông tin"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem || initialForm}
        isEditing={!!editingItem}
      />
    </div>
  );
};

export default SupplierPage;
