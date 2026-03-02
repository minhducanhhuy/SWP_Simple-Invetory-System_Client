import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStockTickets } from "../../services/stockTicketService";
import {
  FaPlus,
  FaFileInvoice,
  FaArrowDown,
  FaArrowUp,
  FaRightLeft,
  FaEye,
} from "react-icons/fa6"; // Dùng Fa6 cho icon sắc nét hơn
import TicketDetailModal from "./components/TicketDetailModal";

const StockTicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý xem chi tiết
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getStockTickets();
        setTickets(data);
      } catch (error) {
        console.error("Lỗi tải danh sách phiếu");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Hàm render Badge có kèm Icon
  const getTypeLabel = (type) => {
    switch (type) {
      case "IMPORT":
        return (
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-200">
            <FaArrowDown className="text-[10px]" /> Nhập hàng
          </span>
        );
      case "SELL":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">
            <FaArrowUp className="text-[10px]" /> Bán hàng
          </span>
        );
      case "TRANSFER":
        return (
          <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md text-xs font-bold border border-orange-200">
            <FaRightLeft className="text-[10px]" /> Chuyển kho
          </span>
        );
      default:
        return <span className="text-gray-600 font-medium">{type}</span>;
    }
  };

  const handleViewDetail = (id) => {
    setSelectedTicketId(id);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaFileInvoice className="text-blue-600" />
            Lịch sử thay đổi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý lịch sử nhập, xuất và điều chuyển hàng hóa
          </p>
        </div>

        <Link
          to="/stock-tickets/create"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <FaPlus /> Tạo phiếu mới
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã phiếu</th>
                <th className="px-6 py-4">Loại phiếu</th>
                <th className="px-6 py-4">Từ kho</th>
                <th className="px-6 py-4">Đến kho</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4">Người tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    Chưa có phiếu nào được tạo.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {t.code}
                    </td>
                    <td className="px-6 py-4">{getTypeLabel(t.type)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {t.sourceLocation?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {t.destLocation?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(t.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {t.creator?.fullName?.charAt(0) || "U"}
                        </div>
                        {t.creator?.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(t.id)} // <--- GẮN HÀM VÀO ĐÂY
                        className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER MODAL Ở CUỐI COMPONENT */}
      <TicketDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        ticketId={selectedTicketId}
      />
    </div>
  );
};

export default StockTicketListPage;
