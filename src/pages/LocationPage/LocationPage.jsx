import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaWarehouse,
  FaMapMarkerAlt,
  FaTrash,
} from "react-icons/fa";
import {
  getMyLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/locationService";
import LocationModal from "./components/LocationModal";

const LocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Data
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await getMyLocations();
      setLocations(data);
    } catch (error) {
      console.error("Lỗi tải danh sách kho:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // 2. Handle Create / Update
  const handleSave = async (formData) => {
    try {
      if (editingLocation) {
        // Update
        await updateLocation(editingLocation.id, formData);
        alert("Cập nhật kho thành công!");
      } else {
        // Create
        await createLocation(formData);
        alert("Tạo kho mới thành công!");
      }

      // Refresh list & Close modal
      fetchLocations();
      setIsModalOpen(false);
      setEditingLocation(null);
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // 3. Open Modal Actions
  const openCreateModal = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa kho: ${code}?\nHành động này không thể hoàn tác!`,
      )
    ) {
      return;
    }

    try {
      await deleteLocation(id);
      alert("Đã xóa kho thành công!");
      // Cập nhật lại danh sách (xóa item khỏi state để đỡ phải gọi lại API)
      setLocations(locations.filter((loc) => loc.id !== id));
    } catch (error) {
      // Backend sẽ trả về lỗi nếu kho còn tồn hoặc có giao dịch (như đã viết ở trên)
      const msg = error.response?.data?.message || "Không thể xóa kho này.";
      alert(`Lỗi: ${msg}`);
    }
  };

  // Filter Logic
  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Kho bãi</h1>
          <p className="text-sm text-gray-500">
            Danh sách các điểm lưu trữ hàng hóa
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã kho..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none w-64 focus:ring-2 focus:ring-purple-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95"
          >
            <FaPlus /> Thêm kho
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Mã Kho</th>
              <th className="px-6 py-4">Tên Kho</th>
              <th className="px-6 py-4">Địa chỉ</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredLocations.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  Chưa có kho nào.
                </td>
              </tr>
            ) : (
              filteredLocations.map((loc) => (
                <tr
                  key={loc.id}
                  className="hover:bg-purple-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono font-bold text-purple-700">
                    {loc.code}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <FaWarehouse className="text-gray-400" /> {loc.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" size={12} />
                      {loc.address || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${loc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {loc.isActive ? "Hoạt động" : "Vô hiệu Hóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Nút Sửa */}
                      <button
                        onClick={() => openEditModal(loc)}
                        className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>

                      {/* [MỚI] Nút Xóa */}
                      <button
                        onClick={() => handleDelete(loc.id, loc.code)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                        title="Xóa kho"
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

      {/* MODAL */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingLocation}
        isEditing={!!editingLocation}
      />
    </div>
  );
};

export default LocationPage;
