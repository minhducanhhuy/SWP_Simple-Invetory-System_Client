// src/pages/StockTicket/components/TicketDetailModal.jsx
import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaPrint,
  FaFileInvoice,
  FaBuilding,
  FaUser,
  FaWarehouse,
  FaCalendarAlt,
} from "react-icons/fa";
import { getStockTicketDetail } from "../../../services/stockTicketService";

const TicketDetailModal = ({ isOpen, onClose, ticketId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      getStockTicketDetail(ticketId)
        .then((data) => setTicket(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setTicket(null);
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  

  const renderExpiryInfo = (expiryDate) => {
    if (!expiryDate) return <span className="text-gray-400">—</span>;

    const expDate = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const formattedDate = expDate.toLocaleDateString("en-GB"); // dd/mm/yyyy

    if (diffDays < 0) {
      return (
        <div className="flex flex-col items-end">
          <span className="text-red-600 font-bold line-through">{formattedDate}</span>
          <span className="text-red-600 text-[10px] font-bold">Đã hết HSD</span>
        </div>
      );
    } else if (diffDays <= 15) {
      return (
        <div className="flex flex-col items-end">
          <span className="text-red-600 font-bold">{formattedDate}</span>
          <span className="text-red-600 text-[10px] font-bold">Sắp hết HSD</span>
        </div>
      );
    }
    return <span className="text-gray-700 font-medium">{formattedDate}</span>;
  };

  // Helper hiển thị badge loại phiếu
  const renderTypeBadge = (type, reason) => {
    const config = {
      IMPORT: { label: "NHẬP HÀNG NCC", color: "bg-green-100 text-green-700" },
      SELL: { label: "XUẤT BÁN LẺ", color: "bg-blue-100 text-blue-700" },
      TRANSFER: { label: "CHUYỂN KHO", color: "bg-orange-100 text-orange-700" },
      ADJUSTMENT: {
        label: "KIỂM KÊ / ĐIỀU CHỈNH",
        color: "bg-purple-100 text-purple-700",
      },
      STOCKTAKE: {
        label: "PHIẾU KIỂM KÊ",
        color: "bg-indigo-100 text-indigo-700",
      },
      RETURN_TO_SUPP: {
        label: "TRẢ HÀNG NCC",
        color: "bg-yellow-100 text-yellow-800",
      },
      RETURN_FROM_CUST: {
        label: "KHÁCH TRẢ HÀNG",
        color: "bg-teal-100 text-teal-800",
      },
    };
    const conf = config[type] || { label: type, color: "bg-gray-100" };

    return (
      <div className="flex flex-col items-start">
        <span
          className={`px-3 py-1 rounded-md text-xs font-bold ${conf.color}`}
        >
          {conf.label}
        </span>
        {/* Hiển thị lý do nếu có */}
        {type !== "STOCKTAKE" && reason && (
          <span className="text-[11px] text-gray-500 mt-1 italic border border-gray-200 px-1 rounded bg-gray-50">
            Lý do: {reason}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FaFileInvoice className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {loading ? "Đang tải..." : ticket?.code}
              </h3>
              <p className="text-xs text-gray-500">Chi tiết phiếu kho</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading || !ticket ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. THÔNG TIN CHUNG (Grid 3 cột) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {/* Cột 1: Thông tin Phiếu */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 border-b pb-1">
                    Thông tin phiếu
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loại phiếu:</span>
                    {renderTypeBadge(ticket.type, ticket.reason)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt /> Ngày tạo:
                    </span>
                    <span className="font-medium">
                      {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  {/* HIỂN THỊ NGƯỜI TẠO TẠI ĐÂY */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FaUser /> Người tạo:
                    </span>
                    <span className="font-medium text-blue-600 flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {ticket.creator?.fullName?.charAt(0) || "U"}
                      </div>
                      {ticket.creator?.fullName}
                    </span>
                  </div>
                </div>

                {/* Cột 2: Kho bãi */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 border-b pb-1">
                    Kho vận hành
                  </h4>
                  {ticket.sourceLocation && (
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">
                        Kho xuất / Kho kiểm kê:
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        <FaWarehouse className="text-gray-400" />{" "}
                        {ticket.sourceLocation.name}
                      </span>
                    </div>
                  )}
                  {ticket.destLocation && (
                    <div className="flex flex-col mt-2">
                      <span className="text-gray-500 text-xs">
                        Kho nhập / Kho đích:
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        <FaWarehouse className="text-gray-400" />{" "}
                        {ticket.destLocation.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cột 3: Đối tác (Nếu có) */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 border-b pb-1">
                    Đối tác
                  </h4>
                  {ticket.supplier ? (
                    <div>
                      <span className="text-gray-500 text-xs">
                        Nhà cung cấp:
                      </span>
                      <p className="font-medium text-blue-700 flex items-center gap-1">
                        <FaBuilding /> {ticket.supplier.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ticket.supplier.phone}
                      </p>
                    </div>
                  ) : ticket.customer ? (
                    <div>
                      <span className="text-gray-500 text-xs">Khách hàng:</span>
                      <p className="font-medium text-blue-700 flex items-center gap-1">
                        <FaUser /> {ticket.customer.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ticket.customer.phone}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">
                      Không có đối tác liên quan
                    </span>
                  )}
                </div>
              </div>

              {/* 2. DANH SÁCH SẢN PHẨM (BẢNG THÔNG MINH ĐỔI GIAO DIỆN THEO LOẠI PHIẾU) */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FaFileInvoice className="text-gray-400" />
                  Chi tiết hàng hóa ({ticket.details.length})
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                      {ticket.type === "STOCKTAKE" ? (
                        // HEADER RIÊNG CHO PHIẾU KIỂM KÊ
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Mã SP</th>
                          <th className="px-4 py-3">Tên sản phẩm</th>
                          <th className="px-4 py-3 text-center">SL Hệ thống</th>
                          <th className="px-4 py-3 text-center">SL Thực đếm</th>
                          <th className="px-4 py-3 text-center">Chênh lệch</th>
                          <th className="px-4 py-3">Lý do chênh lệch</th>
                        </tr>
                      ) : (
                        // HEADER CHO PHIẾU NHẬP/XUẤT BÌNH THƯỜNG
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Mã SP</th>
                          <th className="px-4 py-3">Tên sản phẩm</th>
                          {ticket.type === "IMPORT" && <th className="px-4 py-3 text-right">Hạn sử dụng</th>}
                          <th className="px-4 py-3 text-center">ĐVT</th>
                          <th className="px-4 py-3 text-right">Số lượng</th>
                          <th className="px-4 py-3 text-right">Đơn giá</th>
                          <th className="px-4 py-3 text-right">Thành tiền</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ticket.details.map((item, idx) => {
                        const diff =
                          (item.actualQty ?? 0) - (item.systemQty ?? 0);

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-400">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-600">
                              {item.product.sku}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {item.product.name}
                            </td>

                            {ticket.type === "STOCKTAKE" ? (
                              // RENDER CỘT DỮ LIỆU KIỂM KÊ
                              <>
                                <td className="px-4 py-3 text-center font-bold text-gray-500">
                                  {item.systemQty}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-blue-600">
                                  {item.actualQty}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {diff > 0 ? (
                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                                      +{diff}
                                    </span>
                                  ) : diff < 0 ? (
                                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                      {diff}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600 italic">
                                  {item.note || "—"}
                                </td>
                              </>
                            ) : (
                              // RENDER CỘT DỮ LIỆU NHẬP XUẤT
                              <>
                                <td className="px-4 py-3 text-center text-gray-500 text-xs bg-gray-50 rounded">
                                  {item.product.unit?.name}
                                </td>
                                {/* HIỂN THỊ DỮ LIỆU HSD (KÈM BÁO ĐỎ) */}
                                {ticket.type === "IMPORT" && (
                                  <td className="px-4 py-3 text-right">
                                    {renderExpiryInfo(item.expiryDate)}
                                  </td>
                                )}
                                <td className="px-4 py-3 text-right font-bold text-blue-600">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">
                                  {formatMoney(item.price)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-800">
                                  {formatMoney(item.quantity * item.price)}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* FOOTER TỔNG TIỀN (Chỉ hiện nếu không phải kiểm kê) */}
                    {ticket.type !== "STOCKTAKE" && (
                      <tfoot className="bg-gray-50 font-bold text-gray-900">
                        <tr>
                          <td
                            colSpan={ticket.type === "IMPORT" ? "7" : "6"}
                            className="px-4 py-3 text-right uppercase text-xs tracking-wider"
                          >
                            Tổng giá trị phiếu:
                          </td>
                          <td className="px-4 py-3 text-right text-blue-700 text-base">
                            {formatMoney(
                              ticket.details.reduce(
                                (sum, i) => sum + i.quantity * i.price,
                                0,
                              ),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* 3. GHI CHÚ */}
              {ticket.note && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  <span className="font-bold">📝 Ghi chú:</span> {ticket.note}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 font-medium"
          >
            <FaPrint /> In phiếu
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
