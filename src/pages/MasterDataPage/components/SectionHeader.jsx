import React from "react";
import { FaFileExport, FaFileImport } from "react-icons/fa";

const SectionHeader = ({ title, icon, onExport, onImport }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
      {icon} {title}
    </h2>
    <div className="flex gap-2">
      {/* Nút Xuất Excel */}
      <button
        onClick={onExport}
        className="text-gray-500 hover:text-blue-600 text-[11px] font-bold uppercase flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 transition-all"
        title="Xuất dữ liệu ra Excel"
      >
        <FaFileExport /> Xuất
      </button>
      {/* Nút Nhập Excel */}
      <label className="text-gray-500 hover:text-green-600 text-[11px] font-bold uppercase flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 cursor-pointer transition-all">
        <FaFileImport /> Nhập
        <input
          type="file"
          className="hidden"
          accept=".xlsx, .xls"
          onChange={onImport}
        />
      </label>
    </div>
  </div>
);

export default SectionHeader;
