import { useContext, useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";
import { getProducts } from "../../services/productService";
import {
  getStockTickets,
  approveStockTicket,
  createStockTicket,
} from "../../services/stockTicketService";

const StockTakePage = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || "";
  const { currentLocation } = useLocation();

  const [stockRows, setStockRows] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadStock = async () => {
      if (!currentLocation) return;
      setLoadingStock(true);
      try {
        // LƯU Ý: Đảm bảo API này trả về danh sách tồn kho theo Location (InventoryItem) chứ không phải toàn bộ bảng Product
        const inventoryItems = await getProducts({
          locationId: currentLocation.id,
        });

        const mapped = inventoryItems.map((p) => ({
          productId: p.id, // Lưu productId thật để tí gửi xuống BE
          code: p.sku || p.code || `SP-${p.id}`,
          name: p.name || p.productName || "Không tên",
          expected: p.quantity ?? 0, // Đây là systemQty (Lấy đúng trường số lượng tồn trong InventoryItem)
          actual: p.quantity ?? 0, // Khởi tạo actual = expected
          reason: "",
        }));
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
        const data = await getStockTickets({ status: "PENDING_APPROVAL" });
        setTickets(data || []);
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

  const handleWarehouseChange = (id, field, value) => {
    setStockRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleWarehouseSave = async () => {
    // 1. Lọc món đếm dư (Tăng)
    const itemsToIncrease = stockRows.filter(
      (row) => row.actual > row.expected,
    );
    // 2. Lọc món đếm thiếu (Giảm)
    const itemsToDecrease = stockRows.filter(
      (row) => row.actual < row.expected,
    );

    if (itemsToIncrease.length === 0 && itemsToDecrease.length === 0) {
      setMessage("Không có chênh lệch nào để tạo phiếu!");
      return;
    }

    try {
      if (itemsToIncrease.length > 0) {
        await createStockTicket({
          type: "IMPORT",
          reason: "ADJUSTMENT",
          status: "PENDING_APPROVAL", // Chờ duyệt
          locationId: currentLocation.id, // Truyền id kho hiện tại
          details: itemsToIncrease.map((row) => ({
            productId: row.productId,
            quantity: row.actual - row.expected, // Phần chênh lệch
            systemQty: row.expected,
            actualQty: row.actual,
            note: row.reason,
            price: 0,
          })),
        });
      }

      if (itemsToDecrease.length > 0) {
        await createStockTicket({
          type: "EXPORT",
          reason: "ADJUSTMENT",
          status: "PENDING_APPROVAL", // Chờ duyệt
          locationId: currentLocation.id,
          details: itemsToDecrease.map((row) => ({
            productId: row.productId,
            quantity: row.expected - row.actual, // Phần thiếu hụt (số dương)
            systemQty: row.expected,
            actualQty: row.actual,
            note: row.reason,
            price: 0,
          })),
        });
      }

      setMessage("Đã nộp phiếu kiểm kê thành công! Chờ quản lý duyệt.");
      // Tùy chọn: Gọi lại loadStock() để reset bảng
    } catch (error) {
      console.error(error);
      setMessage("Lỗi khi nộp phiếu kiểm kê.");
    }
  };

  const handleApproveTicket = async (ticketId) => {
    try {
      await approveStockTicket(ticketId);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: "APPROVED" } : t)),
      );
      setMessage("Đã duyệt phiếu kiểm kê.");
    } catch (error) {
      console.error(error);
      setMessage("Không thể duyệt phiếu kiểm kê. Vui lòng thử lại.");
    }
  };

  const handleRejectTicket = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "REJECTED" } : t)),
    );
    setMessage("Đã từ chối phiếu kiểm kê.");
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
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700">
          {message}
        </div>
      )}

      {role === "WAREHOUSE_STAFF" || role === "SALESPERSON" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Bảng kiểm kê
              </h2>
              <p className="text-xs text-gray-500">
                Nhập số lượng thực tế và lý do chênh lệch.
              </p>
            </div>
            <button
              onClick={handleWarehouseSave}
              className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              Lưu kiểm kê
            </button>
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
                    <th className="px-3 py-2 border">Số lượng hệ thống</th>
                    <th className="px-3 py-2 border">Số lượng thực tế</th>
                    <th className="px-3 py-2 border">Lý do chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {stockRows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-200">
                      <td className="px-3 py-2 border">{row.code}</td>
                      <td className="px-3 py-2 border">{row.name}</td>
                      <td className="px-3 py-2 border">{row.expected}</td>
                      <td className="px-3 py-2 border">
                        <input
                          type="number"
                          min={0}
                          value={row.actual}
                          onChange={(e) =>
                            handleWarehouseChange(
                              row.id,
                              "actual",
                              Number(e.target.value),
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
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
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
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
          <p className="text-xs text-gray-500 mb-4">
            Manager có thể duyệt hoặc từ chối phiếu kiểm kê.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-3 py-2 border">Mã phiếu</th>
                  <th className="px-3 py-2 border">Loại</th>
                  <th className="px-3 py-2 border">Kho nguồn</th>
                  <th className="px-3 py-2 border">Kho đích</th>
                  <th className="px-3 py-2 border">Ngày tạo</th>
                  <th className="px-3 py-2 border">Trạng thái</th>
                  <th className="px-3 py-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingTickets ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      Đang tải phiếu...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      Không có phiếu kiểm kê.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-gray-200">
                      <td className="px-3 py-2 border">{ticket.code}</td>
                      <td className="px-3 py-2 border">{ticket.type}</td>
                      <td className="px-3 py-2 border">
                        {ticket.sourceLocation?.name || "—"}
                      </td>
                      <td className="px-3 py-2 border">
                        {ticket.destLocation?.name || "—"}
                      </td>
                      <td className="px-3 py-2 border">
                        {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-3 py-2 border">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            ticket.status === "PENDING_APPROVAL"
                              ? "bg-yellow-100 text-yellow-700"
                              : ticket.status === "COMPLETED" // DB của bạn là COMPLETED
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border space-x-2">
                        <button
                          onClick={() => handleApproveTicket(ticket.id)}
                          disabled={
                            ticket.status &&
                            ticket.status.toUpperCase() !== "PENDING"
                          }
                          className="rounded-md bg-green-600 px-2 py-1 text-white text-xs disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectTicket(ticket.id)}
                          disabled={
                            ticket.status &&
                            ticket.status.toUpperCase() !== "PENDING"
                          }
                          className="rounded-md bg-red-600 px-2 py-1 text-white text-xs disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p>
            Vai trò của bạn chưa được phân quyền kiểm kê. Vui lòng liên hệ quản
            trị.
          </p>
        </div>
      )}
    </div>
  );
};

export default StockTakePage;
