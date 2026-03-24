import { useContext, useEffect, useState } from "react";
import { FaClipboardList, FaEye } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";
import { getProducts } from "../../services/productService";
import * as XLSX from "xlsx"; // <--- Bổ sung thư viện Excel
import { useRef } from "react"; // <--- Bổ sung useRef
import { FaFileImport, FaFileExport } from "react-icons/fa6"; // <--- Bổ sung Icon
import {
  getStockTickets,
  approveStockTicket,
  createStockTicket,
  cancelStockTicket,
} from "../../services/stockTicketService";
import { useNavigate } from "react-router-dom";
// NHỚ CHỈNH LẠI ĐƯỜNG DẪN IMPORT MODAL CHO ĐÚNG VỚI CẤU TRÚC THƯ MỤC CỦA BẠN
import TicketDetailModal from "../StockTicketPage/components/TicketDetailModal";

const StockTakePage = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useContext(AuthContext);
  const role = user?.role || "";
  const { currentLocation } = useLocation();

  const [stockRows, setStockRows] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Dùng để reset ô chọn file sau khi upload xong
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadStock = async () => {
      if (!currentLocation) return;
      setLoadingStock(true);
      try {
        const inventoryItems = await getProducts({
          locationId: currentLocation.id,
        });

        const mapped = inventoryItems.map((p) => {
          const systemQty = p.currentStock ?? (p.inventory?.[0]?.quantity || 0);
          return {
            id: p.id,
            productId: p.id,
            code: p.sku || p.code || `SP-${p.id}`,
            name: p.name || p.productName || "Không tên",
            expected: systemQty,
            actual: systemQty,
            reason: "",
          };
        });
        setStockRows(mapped);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm kiểm kê:", error);
      } finally {
        setLoadingStock(false);
      }
    };
    if (role === "WAREHOUSE_STAFF" || role === "SALESPERSON") {
      loadStock();
    }
  }, [currentLocation, role]);

  useEffect(() => {
    const loadTickets = async () => {
      setLoadingTickets(true);
      try {
        const data = await getStockTickets();
        const pendingTickets = (data || []).filter(
          (t) => t.status === "PENDING_APPROVAL" && t.type === "STOCKTAKE",
        );
        setTickets(pendingTickets);
      } catch (error) {
        console.error("Lỗi lấy phiếu kiểm kê:", error);
      } finally {
        setLoadingTickets(false);
      }
    };
    if (role === "MANAGER" || role === "OWNER") {
      loadTickets();
    }
  }, [role]);

  // --- HÀM 1: XUẤT FILE EXCEL MẪU ---
  const handleExportTemplate = () => {
    if (stockRows.length === 0) {
      alert("Không có sản phẩm nào để xuất!");
      return;
    }

    const excelData = stockRows.map((row, index) => ({
      STT: index + 1,
      "Mã SP": row.code,
      "Tên sản phẩm": row.name,
      "SL Hệ thống": row.expected,
      "SL Thực đếm": row.expected, // Mặc định để bằng hệ thống, ai đếm lệch thì sửa file
      "Lý do chênh lệch": "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kiem_Ke");
    XLSX.writeFile(
      workbook,
      `Kiem_Ke_${currentLocation?.code}_${new Date().getTime()}.xlsx`,
    );
  };

  // --- HÀM NHẬP DỮ LIỆU TỪ EXCEL ---
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 1. Lọc và xử lý dữ liệu ở ngoài (Tránh React Strict Mode gọi 2 lần)
        const validUpdates = [];
        jsonData.forEach((importedRow) => {
          const sku = importedRow["Mã SP"];
          const actual = parseInt(importedRow["SL Thực đếm"]);
          const reason = importedRow["Lý do chênh lệch"] || "";

          if (sku && !isNaN(actual)) {
            // Math.max(0, actual) để ép số âm từ Excel thành 0 luôn
            validUpdates.push({ sku, actual: Math.max(0, actual), reason });
          }
        });

        // 2. Cập nhật dữ liệu vào bảng
        setStockRows((prevRows) => {
          const newRows = [...prevRows];
          validUpdates.forEach((update) => {
            const rowIndex = newRows.findIndex((r) => r.code === update.sku);
            if (rowIndex !== -1) {
              newRows[rowIndex].actual = update.actual;
              newRows[rowIndex].reason = update.reason;
            }
          });
          return newRows;
        });

        // 3. Hiện thông báo 1 lần duy nhất
        alert(
          `✅ Đã nhập thành công dữ liệu đếm của ${validUpdates.length} sản phẩm!`,
        );
      } catch (error) {
        alert(
          "❌ Lỗi đọc file! Vui lòng dùng đúng file mẫu tải về từ hệ thống.",
        );
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };
  const handleWarehouseChange = (id, field, value) => {
    setStockRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleWarehouseSave = async () => {
    if (stockRows.length === 0) {
      setMessage("Không có sản phẩm nào để kiểm kê!");
      return;
    }

    // 1. KIỂM TRA BẮT BUỘC NHẬP LÝ DO NẾU CÓ CHÊNH LỆCH
    const invalidRow = stockRows.find(
      (row) =>
        row.actual !== row.expected &&
        (!row.reason || row.reason.trim() === ""),
    );

    if (invalidRow) {
      alert(
        `⚠️ Sản phẩm "${invalidRow.name}" có chênh lệch. Vui lòng điền vào cột Lý do!`,
      );
      return; // Chặn đứng luồng chạy, không gọi API
    }

    // 2. KHÓA NÚT BẤM (Chống spam click tạo nhiều phiếu)
    setIsSaving(true);

    try {
      await createStockTicket({
        type: "STOCKTAKE",
        reason: "ADJUSTMENT",

        sourceLocationId: currentLocation.id,
        note: "Phiếu kiểm kê định kỳ",
        details: stockRows.map((row) => ({
          productId: row.productId,
          quantity: Math.abs(row.actual - row.expected),
          systemQty: row.expected,
          actualQty: row.actual,
          note: row.reason,
          price: 0,
        })),
      });

      // 3. THÔNG BÁO VÀ CHUYỂN HƯỚNG
      alert("✅ Đã nộp phiếu kiểm kê thành công! Chờ quản lý duyệt.");
      navigate("/stock-tickets"); // Đá người dùng về trang Lịch sử
    } catch (error) {
      console.error(error);
      const beError = error.response?.data?.message;
      const errorMsg = Array.isArray(beError)
        ? beError[0]
        : beError || "Lỗi mạng hoặc server";
      setMessage(`❌ Không thể lưu phiếu: ${errorMsg}`);
    } finally {
      // 4. MỞ KHÓA NÚT (Nếu có lỗi thì mới mở lại để bấm tiếp)
      setIsSaving(false);
    }
  };

  const handleApproveTicket = async (ticketId) => {
    try {
      await approveStockTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setMessage("Đã duyệt phiếu kiểm kê.");
    } catch (error) {
      console.error(error);
      setMessage("Không thể duyệt phiếu kiểm kê. Vui lòng thử lại.");
    }
  };

  const handleRejectTicket = async (ticketId) => {
    const cancelReason = window.prompt(
      "Vui lòng nhập lý do từ chối phiếu này:",
    );

    if (cancelReason === null) return;
    if (cancelReason.trim() === "") {
      alert("BẮT BUỘC phải nhập lý do khi từ chối phiếu!");
      return;
    }

    try {
      await cancelStockTicket(ticketId, cancelReason);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setMessage("Đã từ chối phiếu kiểm kê.");
    } catch (error) {
      console.error(error);
      setMessage("Không thể từ chối phiếu. Vui lòng thử lại.");
    }
  };

  const handleViewDetail = (id) => {
    setSelectedTicketId(id);
    setShowDetailModal(true);
  };

  if (!user) {
    return (
      <div className="p-6 min-h-screen">
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 text-yellow-700">
          Vui lòng đăng nhập để truy cập Kiểm kê.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FaClipboardList className="text-blue-600" /> Kiểm kê tồn kho
        </h1>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700 font-medium">
          {message}
        </div>
      )}

      {role === "WAREHOUSE_STAFF" || role === "SALESPERSON" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Bảng kiểm kê
              </h2>
              <p className="text-xs text-gray-500">
                Nhập tay hoặc dùng file Excel để cập nhật số lượng thực đếm.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* NÚT XUẤT EXCEL MẪU */}
              <button
                onClick={handleExportTemplate}
                className="rounded-md px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-sm transition-all hover:bg-emerald-100 flex items-center gap-2 shadow-sm"
              >
                <FaFileExport /> Tải file mẫu
              </button>

              {/* NÚT IMPORT EXCEL (Nút giả để click, thẻ input thật bị ẩn đi) */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 font-bold text-sm transition-all hover:bg-orange-100 flex items-center gap-2 shadow-sm"
              >
                <FaFileImport /> Tải file đếm lên
              </button>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImportExcel}
              />

              {/* NÚT LƯU PHIẾU GỐC CỦA BẠN */}
              <button
                onClick={handleWarehouseSave}
                disabled={isSaving}
                className={`rounded-md px-4 py-2 text-white font-bold transition-all shadow-sm flex items-center gap-2 ml-2 ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FaClipboardList /> {isSaving ? "Đang xử lý..." : "Nộp phiếu"}
              </button>
            </div>
          </div>

          {loadingStock ? (
            <div className="py-6 text-center text-gray-500">
              Đang tải sản phẩm kiểm kê...
            </div>
          ) : stockRows.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              Không có sản phẩm cho kho hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="px-3 py-2 border">Mã SP</th>
                    <th className="px-3 py-2 border">Tên sản phẩm</th>
                    <th className="px-3 py-2 border text-center">
                      SL Hệ thống
                    </th>
                    <th className="px-3 py-2 border text-center">
                      SL Thực đếm
                    </th>
                    <th className="px-3 py-2 border">Lý do chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {stockRows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-200">
                      <td className="px-3 py-2 border">{row.code}</td>
                      <td className="px-3 py-2 border">{row.name}</td>
                      <td className="px-3 py-2 border text-center font-bold text-gray-600">
                        {row.expected}
                      </td>
                      <td className="px-3 py-2 border w-32">
                        <input
                          type="number"
                          min={0}
                          value={row.actual}
                          onChange={(e) => {
                            // Lấy giá trị nhập vào, nếu người dùng xóa trắng thì gán bằng 0
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 0;

                            // Dùng Math.max để ÉP BUỘC không cho phép số âm
                            handleWarehouseChange(
                              row.id,
                              "actual",
                              Math.max(0, val),
                            );
                          }}
                          className="w-full text-center rounded-md border border-gray-300 px-2 py-1 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 border">
                        <input
                          value={row.reason}
                          onChange={(e) =>
                            handleWarehouseChange(
                              row.id,
                              "reason",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Nhập lý do..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : role === "MANAGER" || role === "OWNER" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Lịch sử kiểm kê (phiếu chờ duyệt)
          </h2>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-3 py-2 border">Mã phiếu</th>
                  <th className="px-3 py-2 border">Ngày tạo</th>
                  {/* CỘT NGƯỜI TẠO ĐƯỢC THÊM Ở ĐÂY */}
                  <th className="px-3 py-2 border">Người tạo</th>
                  <th className="px-3 py-2 border">Kết quả đếm</th>
                  <th className="px-3 py-2 border text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      Đang tải phiếu...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      Không có phiếu chờ duyệt.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const hasDiff = ticket.details?.some(
                      (d) => d.actualQty !== d.systemQty,
                    );

                    return (
                      <tr
                        key={ticket.id}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 border font-bold text-gray-800">
                          {ticket.code}
                        </td>
                        <td className="px-3 py-2 border text-gray-600">
                          {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                        </td>

                        {/* HIỂN THỊ DỮ LIỆU NGƯỜI TẠO Ở ĐÂY */}
                        <td className="px-3 py-2 border">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                              {ticket.creator?.fullName?.charAt(0) || "U"}
                            </div>
                            <span className="font-medium text-gray-700">
                              {ticket.creator?.fullName}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-2 border">
                          {hasDiff ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                              ⚠️ Có chênh lệch
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                              ✅ Khớp 100%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border space-x-2 text-center">
                          <button
                            onClick={() => handleViewDetail(ticket.id)}
                            className="rounded-md bg-blue-100 px-2 py-1.5 text-blue-600 hover:bg-blue-200 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <FaEye /> Chi tiết
                          </button>
                          <button
                            onClick={() => handleApproveTicket(ticket.id)}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 text-xs font-bold"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectTicket(ticket.id)}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 text-xs font-bold"
                          >
                            Từ chối
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <TicketDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        ticketId={selectedTicketId}
      />
    </div>
  );
};

export default StockTakePage;
