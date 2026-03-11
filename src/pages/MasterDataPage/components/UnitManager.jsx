import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FaPlus } from "react-icons/fa";
import SectionHeader from "./SectionHeader";
import MasterItem from "./MasterItem";
import {
  createUnit,
  updateUnit,
  deleteUnit,
  bulkCreateUnits,
  syncUnits,
} from "../../../services/masterDataService";

const UnitManager = ({ units, refresh }) => {
  // States quản lý việc thêm mới và chỉnh sửa
  const [newUnit, setNewUnit] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // --- 1. XỬ LÝ THÊM MỚI ---
  const handleAdd = async () => {
    if (!newUnit.trim()) return;
    try {
      await createUnit({ name: newUnit });
      setNewUnit(""); // Reset input sau khi thêm thành công
      refresh(); // Tải lại danh sách từ server
    } catch (err) {
      alert(
        "Lỗi: " + (err.response?.data?.message || "Đơn vị tính đã tồn tại"),
      );
    }
  };

  // --- 2. XỬ LÝ XUẤT EXCEL ---
  const handleExport = () => {
    // Chuẩn bị dữ liệu chỉ lấy cột tên đơn vị
    const exportData = units.map((item) => ({ "Tên Đơn Vị": item.name }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Units");
    XLSX.writeFile(workbook, "Danh_Sach_Don_Vi_Tinh.xlsx");
  };

  // --- 3. XỬ LÝ NHẬP EXCEL (BULK IMPORT) ---
  const handleImport = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const rows = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]],
        );

        const formattedData = rows
          .map((row) => ({
            name: String(
              row["Tên Đơn Vị"] || row["Tên"] || row["name"] || "",
            ).trim(),
          }))
          .filter((item) => item.name !== "");

        // Gọi API Sync thay vì BulkCreate
        const response = await syncUnits(formattedData);

        // Hiển thị thông báo chi tiết
        let resultMsg = `Thành công: Thêm mới ${response.createdCount}, Xóa ${response.deletedCount}.`;

        if (response.skippedDeletions && response.skippedDeletions.length > 0) {
          resultMsg += `\n\n⚠️ Không thể xóa các mục sau (đang có sản phẩm sử dụng): \n- ${response.skippedDeletions.join("\n- ")}`;
        }

        alert(resultMsg);
        refresh();
      } catch (err) {
        alert(
          "Lỗi đồng bộ: " + (err.response?.data?.message || "Server Error"),
        );
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* Header chứa các nút Export/Import */}
      <SectionHeader
        title="Quản lý Đơn Vị Tính"
        icon="⚖️"
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Input thêm nhanh đơn vị mới */}
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2.5 rounded-lg w-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition-all"
          placeholder="Tên ĐVT (VD: Chai, Lon, Thùng)..."
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 shadow-md transition-colors"
        >
          <FaPlus />
        </button>
      </div>

      {/* Danh sách hiển thị các đơn vị tính */}
      <ul className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {units.length > 0 ? (
          units.map((unit) => (
            <MasterItem
              key={unit.id}
              item={unit}
              count={unit._count?.products}
              isEditing={editingId === unit.id}
              editName={editingName}
              setEditName={setEditingName}
              onEdit={(item) => {
                setEditingId(item.id);
                setEditingName(item.name);
              }}
              onCancel={() => setEditingId(null)}
              onSave={async (id) => {
                try {
                  await updateUnit(id, { name: editingName });
                  setEditingId(null);
                  refresh();
                } catch (err) {
                  alert("Lỗi cập nhật đơn vị tính.");
                }
              }}
              onDelete={async (id) => {
                if (
                  window.confirm(`Bạn có chắc muốn xóa đơn vị "${unit.name}"?`)
                ) {
                  try {
                    await deleteUnit(id);
                    refresh();
                  } catch (err) {
                    // Backend trả về lỗi nếu ĐVT đang có sản phẩm sử dụng
                    alert(
                      err.response?.data?.message ||
                        "Không thể xóa đơn vị này.",
                    );
                  }
                }
              }}
            />
          ))
        ) : (
          <li className="text-center py-10 text-gray-400 italic text-sm">
            Chưa có dữ liệu đơn vị tính.
          </li>
        )}
      </ul>
    </div>
  );
};

export default UnitManager;
