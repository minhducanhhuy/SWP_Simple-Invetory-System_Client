// src/pages/ProductPage/components/StockCardModal.jsx
import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaExchangeAlt,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle,
} from "react-icons/fa";
import { getProductHistory } from "../../../services/productService";

const StockCardModal = ({ isOpen, onClose, productId }) => {
  const [history, setHistory] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      getProductHistory(productId)
        .then((data) => {
          setProductInfo(data.product);
          setHistory(data.history);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  // Helper render loại phiếu và lý do
  const renderTypeAndReason = (ticket) => {
    let typeName = "";
    let colorClass = "";
    let icon = null;

    switch (ticket.type) {
      case "IMPORT":
        typeName = "Nhập hàng NCC";
        colorClass = "text-green-600 bg-green-50";
        icon = <FaArrowDown className="mr-1" />;
        break;
      case "SELL":
        typeName = "Xuất bán lẻ";
        colorClass = "text-blue-600 bg-blue-50";
        icon = <FaArrowUp className="mr-1" />;
        break;
      case "ADJUSTMENT":
        typeName = "Kiểm kê / Điều chỉnh";
        colorClass = "text-purple-600 bg-purple-50";
        icon = <FaExchangeAlt className="mr-1" />;
        break;
      case "TRANSFER":
        typeName = "Chuyển kho";
        colorClass = "text-orange-600 bg-orange-50";
        break;
      default:
        typeName = ticket.type;
        colorClass = "text-gray-600 bg-gray-50";
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <span
          className={`flex items-center px-2 py-1 rounded text-xs font-bold ${colorClass}`}
        >
          {icon} {typeName}
        </span>

        {/* LOGIC HIỂN THỊ REASON CODE */}
        {ticket.type === "ADJUSTMENT" && ticket.reason && (
          <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium italic border border-gray-200 px-1.5 py-0.5 rounded">
            <FaInfoCircle size={10} />
            Lý do:{" "}
            {ticket.reason === "SCRAP"
              ? "Xuất hủy"
              : ticket.reason === "INTERNAL_USE"
                ? "Dùng nội bộ"
                : ticket.reason}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaExchangeAlt /> Thẻ Kho (Lịch sử giao dịch)
            </h3>
            {productInfo && (
              <p className="text-sm text-gray-300 mt-1">
                {productInfo.name} <span className="opacity-60">|</span> SKU:{" "}
                {productInfo.sku}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              Chưa có giao dịch nào phát sinh.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 w-32">Ngày chứng từ</th>
                    <th className="px-4 py-3 w-32">Mã phiếu</th>
                    <th className="px-4 py-3">Diễn giải / Loại phiếu</th>
                    <th className="px-4 py-3 text-right">Số lượng</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-right">Người tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(tx.ticket.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-600 font-medium">
                        {tx.ticket.code}
                      </td>
                      <td className="px-4 py-3">
                        {renderTypeAndReason(tx.ticket)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          // Logic màu sắc: Nhập dương (xanh), Xuất âm (đỏ)
                          ["IMPORT", "RETURN_FROM_CUST"].includes(
                            tx.ticket.type,
                          )
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {/* Logic dấu: Nếu là xuất thì thêm dấu trừ cho trực quan */}
                        {["SELL", "TRANSFER", "RETURN_TO_SUPP"].includes(
                          tx.ticket.type,
                        )
                          ? "-"
                          : "+"}
                        {tx.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(tx.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">
                        {tx.ticket.creator?.fullName || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockCardModal;
