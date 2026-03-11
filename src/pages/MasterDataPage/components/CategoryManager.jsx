import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FaPlus } from "react-icons/fa";
import SectionHeader from "./SectionHeader";
import MasterItem from "./MasterItem";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  syncCategories,
} from "../../../services/masterDataService";

const CategoryManager = ({ categories, refresh }) => {
  const [newCat, setNewCat] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    try {
      await createCategory({ name: newCat });
      setNewCat("");
      refresh();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleExport = () => {
    const data = categories.map((item) => ({ "Tên Danh Mục": item.name }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");
    XLSX.writeFile(wb, "Danh_Muc_San_Pham.xlsx");
  };

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
              row["Tên"] || row["Tên Danh Mục"] || row["name"] || "",
            ).trim(),
          }))
          .filter((item) => item.name !== "");

        // Gọi API Sync
        const res = await syncCategories(formattedData);

        let msg = `✅ Đồng bộ hoàn tất:\n- Thêm mới: ${res.createdCount}\n- Đã xóa: ${res.deletedCount}`;

        if (res.skippedDeletions.length > 0) {
          msg += `\n\n⚠️ Không thể xóa ${res.skippedDeletions.length} mục đang có sản phẩm:\n- ${res.skippedDeletions.join("\n- ")}`;
        }

        alert(msg);
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
      <SectionHeader
        title="Quản lý Danh Mục"
        icon="📂"
        onExport={handleExport}
        onImport={handleImport}
      />
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2.5 rounded-lg w-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          placeholder="Tên danh mục mới..."
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
        </button>
      </div>
      <ul className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {categories.map((c) => (
          <MasterItem
            key={c.id}
            item={c}
            count={c._count?.products}
            isEditing={editingId === c.id}
            editName={editingName}
            setEditName={setEditingName}
            onEdit={(item) => {
              setEditingId(item.id);
              setEditingName(item.name);
            }}
            onCancel={() => setEditingId(null)}
            onSave={async (id) => {
              await updateCategory(id, { name: editingName });
              setEditingId(null);
              refresh();
            }}
            onDelete={async (id) => {
              if (window.confirm("Xóa danh mục này?")) {
                await deleteCategory(id);
                refresh();
              }
            }}
          />
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;
