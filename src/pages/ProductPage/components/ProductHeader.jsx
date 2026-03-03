import React from "react";
import { FaFileExcel } from "react-icons/fa";

const ProductHeader = () => {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý sản phẩm
        </h2>
        <p className="text-sm text-gray-500">
          Danh sách và quản lý thông tin hàng hóa
        </p>
      </div>

      <button className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 shadow-sm transition-all hover:bg-green-100 focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
        <FaFileExcel className="h-4 w-4" />
        <span>Xuất Excel</span>
      </button>
    </div>
  );
};

export default ProductHeader;
