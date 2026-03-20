import React from "react";
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
} from "react-icons/fa"; // Dùng fa6 cho icon mới nhất

import { FaClockRotateLeft } from "react-icons/fa6";

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onHistory,
  isSalesperson,
}) => {
  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Sản phẩm</th>
              <th className="px-6 py-4 font-medium">Danh Mục</th>
              <th className="px-6 py-4 font-medium">Mô tả</th>
              
              {/* [LOGIC] Ẩn cột Giá Vốn */}
              {!isSalesperson && (
                <th className="px-6 py-4 font-medium text-right">Giá Vốn</th>
              )}

              <th className="px-6 py-4 font-medium text-right">Giá Bán</th>
              <th className="px-6 py-4 font-medium text-center">Tồn Kho</th>

              {/* [LOGIC] Ẩn cột Thao Tác */}
              {!isSalesperson && (
                <th className="px-6 py-4 font-medium text-center">Thao Tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr
                key={p.id}
                className="group transition-colors hover:bg-blue-50/30"
              >
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/50?text=IMG";
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 line-clamp-1">
                        {p.name}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          <FaBoxOpen className="h-3 w-3" /> {p.sku}
                        </span>
                        <span>•</span>
                        <span>{p.unit.name}</span>
                      </div>
                    </div>
                  </div>
                </td>

                
                {/* Cột 2: Danh mục (Giữ nguyên) */}
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {p.category?.name}
                  </span>
                </td>

                {/* Cột 3: Mô tả */}
<td className="px-6 py-4 max-w-[250px]">
  <span className="text-gray-600 text-sm line-clamp-2">
    {p.description || "Không có"}
  </span>
</td>

                {/* [LOGIC] Cột Giá Vốn: Ẩn nếu là Sale */}
                {!isSalesperson && (
                  <td className="px-6 py-4 text-right font-medium text-gray-600">
                    {formatCurrency(p.costPrice)}
                  </td>
                )}

                {/* Cột 3: Giá Bán (Giữ nguyên) */}
                <td className="px-6 py-4 text-right font-semibold text-blue-600">
                  {formatCurrency(p.sellPrice)}
                </td>

                {/* Cột 4: Tồn kho (Giữ nguyên) */}
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-base font-bold ${p.currentStock > 0 ? "text-gray-900" : "text-red-500"}`}
                    >
                      {p.currentStock}
                    </span>
                    {p.currentStock <= p.minStockLevel && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 border border-red-100">
                        <FaExclamationTriangle className="h-3 w-3" /> Sắp hết
                      </span>
                    )}
                  </div>
                </td>



                {/* [LOGIC] Cột Thao tác: Ẩn nếu là Sale */}
                {!isSalesperson && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onHistory(p.id)}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        title="Thẻ kho"
                      >
                        <FaClockRotateLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(p)}
                        className="rounded-full p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Không tìm thấy sản phẩm nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
