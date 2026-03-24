import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // <-- Thêm dòng này
import {
  getStockTickets,
  receiveTransfer,
  approveStockTicket, // <-- Thêm hàm duyệt
  cancelStockTicket, // <-- Thêm hàm từ chối
} from "../../services/stockTicketService";
import * as XLSX from "xlsx";
import { FaCheck, FaTimes } from "react-icons/fa"; // <-- Thêm Icon
import { FaFileExcel } from "react-icons/fa6"; // Thêm icon Excel cho đẹp
// Bổ sung thêm receiveTransfer vào dòng import
import { useLocation } from "../../context/LocationContext"; // Import LocationContext
import { FaTruckFast } from "react-icons/fa6"; // Thêm icon xe tải
import {
  FaPlus,
  FaFileInvoice,
  FaArrowDown,
  FaArrowUp,
  FaRightLeft,
  FaEye,
  FaClipboardList,
} from "react-icons/fa6"; // Dùng Fa6 cho icon sắc nét hơn
import TicketDetailModal from "./components/TicketDetailModal";

const StockTicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý xem chi tiết
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Thêm các state này vào đầu file StockTicketListPage.jsx
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(""); // "" là Tất cả
  const [filterStatus, setFilterStatus] = useState("");
  const { user } = useContext(AuthContext); // Lấy role của user hiện tại
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

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. [LOGIC CỦA BẠN] Ẩn phiếu Kiểm kê đang chờ duyệt khỏi trang Lịch sử
      if (t.type === "STOCKTAKE" && t.status === "PENDING_APPROVAL") {
        return false; // Loại bỏ thẳng tay khỏi danh sách hiển thị
      }

      // 2. Lọc theo mã phiếu
      const matchSearch = t.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // 3. Lọc theo loại phiếu
      const matchType = filterType ? t.type === filterType : true;

      // 4. Lọc theo trạng thái
      const matchStatus = filterStatus ? t.status === filterStatus : true;

      return matchSearch && matchType && matchStatus;
    });
  }, [tickets, searchTerm, filterType, filterStatus]);

  const { currentLocation } = useLocation(); // Lấy thông tin kho hiện tại của người dùng

  // HÀM DUYỆT YÊU CẦU CHUYỂN KHO (Dành cho Sếp)
  const handleApproveTransfer = async (ticketId) => {
    if (
      window.confirm(
        "Xác nhận duyệt yêu cầu chuyển kho này? Hàng sẽ được xuất đi ngay!",
      )
    ) {
      try {
        setLoading(true);
        await approveStockTicket(ticketId);
        alert("✅ Đã duyệt phiếu thành công!");
        const data = await getStockTickets();
        setTickets(data);
      } catch (error) {
        alert(
          "❌ Lỗi: " +
            (error.response?.data?.message || "Không thể duyệt phiếu"),
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // HÀM TỪ CHỐI YÊU CẦU CHUYỂN KHO (Dành cho Sếp)
  const handleRejectTransfer = async (ticketId) => {
    const reason = window.prompt("Nhập lý do từ chối yêu cầu chuyển kho này:");
    if (reason === null) return;
    if (!reason.trim()) return alert("Bắt buộc phải nhập lý do từ chối!");

    try {
      setLoading(true);
      await cancelStockTicket(ticketId, reason);
      alert("✅ Đã hủy phiếu yêu cầu chuyển kho!");
      const data = await getStockTickets();
      setTickets(data);
    } catch (error) {
      alert(
        "❌ Lỗi: " + (error.response?.data?.message || "Không thể hủy phiếu"),
      );
    } finally {
      setLoading(false);
    }
  };

  // HÀM XỬ LÝ KHI BẤM NÚT NHẬN HÀNG
  const handleReceiveTransfer = async (ticketId) => {
    if (
      window.confirm("Xác nhận kho của bạn đã nhập đủ số lượng hàng từ xe tải?")
    ) {
      try {
        // [SỬA Ở ĐÂY] Truyền thêm currentLocation.id làm bằng chứng
        await receiveTransfer(ticketId, [], currentLocation.id);
        alert("✅ Nhận hàng thành công! Đã cộng vào tồn kho.");

        // Load lại danh sách phiếu để cập nhật trạng thái
        setLoading(true);
        const data = await getStockTickets();
        setTickets(data);
      } catch (error) {
        alert(
          "❌ Lỗi: " + (error.response?.data?.message || "Không thể nhận hàng"),
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // HÀM XUẤT EXCEL
  const handleExportExcel = () => {
    if (filteredTickets.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // 1. "Xào" lại dữ liệu cho đẹp trước khi đưa vào Excel
    // Vì Excel không hiểu được các object lồng nhau như creator.fullName
    const excelData = filteredTickets.map((t, index) => ({
      STT: index + 1,
      "Mã phiếu": t.code,
      "Loại phiếu":
        t.type === "IMPORT"
          ? "Nhập hàng"
          : t.type === "EXPORT"
            ? "Xuất hàng"
            : t.type === "TRANSFER"
              ? "Chuyển kho"
              : "Kiểm kê",
      "Trạng thái":
        t.status === "COMPLETED"
          ? "Hoàn thành"
          : t.status === "CANCELLED"
            ? "Đã hủy"
            : t.status === "PENDING_APPROVAL"
              ? "Chờ duyệt"
              : t.status === "IN_TRANSIT"
                ? "Đang đi đường" // <-- THÊM DÒNG NÀY ĐỂ XUẤT EXCEL RA TIẾNG VIỆT
                : t.status,
      "Từ kho": t.sourceLocation?.name || "",
      "Đến kho": t.destLocation?.name || "",
      "Ngày tạo": new Date(t.createdAt).toLocaleString("vi-VN"),
      "Người tạo": t.creator?.fullName || "Hệ thống",
      "Ghi chú": t.note || "",
    }));

    // 2. Tạo một Worksheet (Trang tính) từ dữ liệu đã xào
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // [Tùy chọn] Chỉnh độ rộng các cột cho đẹp
    const wscols = [
      { wch: 5 }, // STT
      { wch: 20 }, // Mã phiếu
      { wch: 15 }, // Loại phiếu
      { wch: 15 }, // Trạng thái
      { wch: 25 }, // Từ kho
      { wch: 25 }, // Đến kho
      { wch: 20 }, // Ngày tạo
      { wch: 20 }, // Người tạo
      { wch: 30 }, // Ghi chú
    ];
    worksheet["!cols"] = wscols;

    // 3. Tạo một Workbook (File Excel) và nhét Worksheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lich_Su_Phieu");

    // 4. Lưu file và kích hoạt tải xuống
    XLSX.writeFile(workbook, `Bao_Cao_Phieu_Kho_${new Date().getTime()}.xlsx`);
  };

  // Hàm render Badge có kèm Icon
  const getTypeLabel = (type) => {
    switch (type) {
      case "IMPORT":
        return (
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold border border-green-200">
            <FaArrowDown className="text-[10px]" /> Nhập hàng
          </span>
        );
      case "EXPORT":
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">
            <FaArrowUp className="text-[10px]" /> Xuất hàng
          </span>
        );

      case "STOCKTAKE":
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-200">
            <FaClipboardList className="text-[10px]" /> Kiểm kê
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
        {/* CỤM NÚT BẤM BÊN PHẢI */}
        <div className="flex gap-3">
          {/* NÚT XUẤT EXCEL */}
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <FaFileExcel /> Xuất Excel
          </button>

          <Link
            to="/stock-tickets/create"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <FaPlus /> Tạo phiếu mới
          </Link>
        </div>
      </div>

      {/* BỘ LỌC (FILTERS) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
        {/* Search Mã Phiếu */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 Tìm theo mã phiếu..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lọc Loại Phiếu */}
        <select
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">🛒 Tất cả loại phiếu</option>
          <option value="IMPORT">Nhập hàng</option>
          <option value="EXPORT">Xuất hàng</option>
          <option value="TRANSFER">Chuyển kho</option>
          <option value="STOCKTAKE">Kiểm kê</option>
        </select>

        {/* Lọc Trạng Thái */}
        <select
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">⏳ Tất cả trạng thái</option>
          <option value="COMPLETED">✅ Hoàn thành</option>
          <option value="PENDING_APPROVAL">⚠️ Chờ duyệt</option>
          <option value="IN_TRANSIT">🚚 Đang đi đường</option>{" "}
          {/* <-- THÊM DÒNG NÀY */}
          <option value="CANCELLED">❌ Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã phiếu</th>
                <th className="px-6 py-4">Loại phiếu</th>
                {/* Bổ sung cột Trạng thái */}
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Từ kho</th>
                <th className="px-6 py-4">Đến kho</th>
                <th className="px-6 py-4">Ngày tạo</th>
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
              ) : filteredTickets.length === 0 ? ( // <--- FIX LỖI 1: ĐỔI THÀNH filteredTickets
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    Không tìm thấy phiếu nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(
                  (
                    t, // <--- FIX LỖI 1: ĐỔI THÀNH filteredTickets
                  ) => (
                    <tr
                      key={t.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      {/* 1. CỘT MÃ PHIẾU */}
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {t.code}
                      </td>

                      {/* 2. CỘT LOẠI PHIẾU (ĐÃ GỌI HÀM getTypeLabel Ở ĐÂY) */}
                      <td className="px-6 py-4">{getTypeLabel(t.type)}</td>

                      {/* 3. CỘT TRẠNG THÁI */}
                      <td className="px-6 py-4">
                        {t.status === "COMPLETED" ? (
                          <span className="bg-green-100 text-green-700 px-2.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 border border-green-200">
                            ✅ Hoàn thành
                          </span>
                        ) : t.status === "CANCELLED" ? (
                          <span className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 border border-red-200">
                            ❌ Đã hủy
                          </span>
                        ) : t.status === "PENDING_APPROVAL" ? (
                          <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 border border-yellow-200">
                            ⏳ Chờ duyệt
                          </span>
                        ) : t.status === "IN_TRANSIT" ? (
                          <span className="bg-orange-100 text-orange-700 px-2.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 border border-orange-200 shadow-sm">
                            🚚 Đang đi đường
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-md text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 border border-gray-200">
                            {t.status}
                          </span>
                        )}
                      </td>

                      {/* 4. CỘT TỪ KHO */}
                      <td className="px-6 py-4 text-gray-500">
                        {t.sourceLocation?.name || "—"}
                      </td>

                      {/* 5. CỘT ĐẾN KHO */}
                      <td className="px-6 py-4 text-gray-500">
                        {t.destLocation?.name || "—"}
                      </td>

                      {/* 6. CỘT NGÀY TẠO */}
                      <td className="px-6 py-4">
                        {new Date(t.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* 7. CỘT THAO TÁC */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(t.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>

                          {t.reason === "TRANSFER" &&
                            t.status === "PENDING_APPROVAL" &&
                            (user?.role === "OWNER" ||
                              user?.role === "MANAGER") && (
                              <>
                                <button
                                  onClick={() => handleApproveTransfer(t.id)}
                                  className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                  title="Duyệt yêu cầu"
                                >
                                  <FaCheck /> Duyệt
                                </button>
                                <button
                                  onClick={() => handleRejectTransfer(t.id)}
                                  className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                  title="Từ chối"
                                >
                                  <FaTimes /> Hủy
                                </button>
                              </>
                            )}

                          {/* 2. NÚT NHẬN HÀNG (CHỈ THỦ KHO TẠI KHO ĐÍCH MỚI ĐƯỢC THẤY VÀ BẤM) */}
                          {t.reason === "TRANSFER" &&
                            t.status === "IN_TRANSIT" &&
                            t.destLocationId === currentLocation?.id &&
                            user?.role ===
                              "WAREHOUSE_STAFF" /* <--- Thêm còng số 8 này vào */ && (
                              <button
                                // TRUYỀN THÊM currentLocation.id XUỐNG API ĐỂ SERVER KIỂM TRA
                                onClick={() => handleReceiveTransfer(t.id)}
                                className="bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                                title="Xác nhận nhận hàng"
                              >
                                <FaTruckFast className="text-sm" /> Nhận hàng
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
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
