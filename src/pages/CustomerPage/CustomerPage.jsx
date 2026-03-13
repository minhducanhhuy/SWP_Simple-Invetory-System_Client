import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerService";

// --- MODAL KHÁCH HÀNG ---
const CustomerModal = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.code || !formData.name)
      return alert("Vui lòng nhập Mã và Tên khách hàng!");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {isEditing ? "Cập Nhật Khách Hàng" : "Thêm Khách Hàng Mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mã KH <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border p-2 rounded-lg bg-gray-50 font-bold uppercase outline-none focus:ring-2 focus:ring-green-500"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="KH001"
                disabled={isEditing}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nguyễn Văn A..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Số điện thoại
            </label>
            <input
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="098..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Địa chỉ
            </label>
            <textarea
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none h-24"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Địa chỉ giao hàng..."
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200"
          >
            Lưu Thông Tin
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGE ---
const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const initialForm = { code: "", name: "", phone: "", address: "" };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        await updateCustomer(data.id, data);
        alert("Cập nhật thành công!");
      } else {
        await createCustomer(data);
        alert("Thêm khách hàng thành công!");
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa khách hàng này?")) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa (đã có giao dịch)");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Khách Hàng</h1>
          <p className="text-sm text-gray-500">
            Danh sách khách hàng thân thiết
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"
        >
          <FaPlus /> Thêm Khách
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all"
              placeholder="Tìm theo Tên, SĐT, Mã KH, Địa Chỉ ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Mã KH</th>
                <th className="px-6 py-4">Họ và Tên</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Địa chỉ</th>
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
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-green-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-green-700">
                      {c.code}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                        <FaUser />
                      </div>
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      <FaPhone className="inline mr-1 text-gray-400" />{" "}
                      {c.phone || "---"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {c.address || "---"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(c);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
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

      {/* Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem || initialForm}
        isEditing={!!editingItem}
      />
    </div>
  );
};

export default CustomerPage;
