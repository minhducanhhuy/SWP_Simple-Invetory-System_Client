import React from "react";
import { FaPlus, FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";

const ProductToolbar = ({
  onOpenModal,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories = [],
  isSalesperson,
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* [LOGIC MỚI] Chỉ hiện nút Thêm nếu KHÔNG phải Salesperson */}
        {!isSalesperson && (
          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
          >
            <FaPlus className="h-4 w-4" />
            <span>Thêm mới</span>
          </button>
        )}
        {/* --- CUSTOM SELECT BOX --- */}
        <div className="relative group">
          {/* Icon Filter bên trái */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 z-10">
            <FaFilter className="h-3 w-3" />
          </div>

          <select
            className="appearance-none w-full min-w-[200px] cursor-pointer rounded-lg 
            bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-gray-700 shadow-sm transition-all 
            
            /* --- FIX MẤT VIỀN TẠI ĐÂY --- */
            border-0 ring-1 ring-inset ring-gray-300 
            focus:ring-2 focus:ring-blue-500 focus:outline-none 
            hover:bg-gray-50 hover:ring-gray-400"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Icon Mũi tên Custom bên phải */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 group-hover:text-gray-600 z-10">
            <FaChevronDown className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative w-full md:w-80">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <FaSearch className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm tên, SKU..."
          /* Áp dụng tương tự cho ô search để đồng bộ */
          className="w-full rounded-xl border-0 ring-1 ring-inset ring-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm shadow-inner transition-all focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProductToolbar;
