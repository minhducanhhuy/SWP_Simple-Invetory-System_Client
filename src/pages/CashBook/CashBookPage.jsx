import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import { useNavigate } from "react-router-dom";
import {
  getCashTransactions,
  createCashTransaction,
} from "../../services/cashService";
import {
  FaPlus,
  FaMinus,
  FaCashRegister,
  FaWallet,
  FaSearch,
  FaFileExcel,
} from "react-icons/fa";

// === 1. IMPORT SIDEBAR & HEADER VÀO ĐÂY ===
import Sidebar from "../../components/Sidebar/Sidebar"; // Chỉnh lại đường dẫn cho đúng thư mục của bạn
import Header from "../../components/Header/Header"; // Thêm Header nếu bạn muốn có thanh chọn kho ở trên
// ==========================================

const CashbookPage = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "OUT",
    category: "EXPENSE",
    amount: "",
    note: "",
  });

  const fetchData = async () => {
    if (currentLocation) {
      const data = await getCashTransactions(currentLocation.id);
      setTransactions(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentLocation]);

  // Tính toán Tồn quỹ
  const totalIn = transactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOut = transactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIn - totalOut;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0)
      return alert("Vui lòng nhập số tiền hợp lệ!");

    try {
      await createCashTransaction({
        ...formData,
        locationId: currentLocation.id,
        amount: Number(formData.amount),
      });
      setIsModalOpen(false);
      setFormData({ type: "OUT", category: "EXPENSE", amount: "", note: "" });
      fetchData();
      alert("✅ Lập phiếu thành công!");
    } catch (error) {
      alert("❌ Lỗi: " + error.message);
    }
  };

  const translateCategory = (cat) => {
    const dict = {
      SALE: "Bán hàng",
      IMPORT_PAY: "Trả tiền hàng",
      EXPENSE: "Chi phí",
      OTHER_IN: "Thu khác",
      OTHER_OUT: "Chi khác",
    };
    return dict[cat] || cat;
  };

  if (!currentLocation)
    return <div className="p-6 text-gray-500">Vui lòng chọn chi nhánh...</div>;

  return (
    // === 2. BỌC TOÀN BỘ TRANG VÀO MỘT THẺ DIV CÓ flex h-screen ===
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* 3. ĐẶT SIDEBAR Ở ĐÂY (Cột trái) */}
      <Sidebar />

      {/* 4. CỘT PHẢI (Chứa Header và Nội dung chính) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ĐẶT HEADER Ở ĐÂY (Nếu bạn cần thanh chọn kho ở trên) */}
        <Header />

        {/* NỘI DUNG CHÍNH (Có thể cuộn được) */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* 1. THỐNG KÊ NHANH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-xs text-gray-500 font-bold tracking-wider mb-1">
                TỔNG THU
              </p>
              <h2 className="text-2xl font-black text-green-600">
                {totalIn.toLocaleString("vi-VN")} ₫
              </h2>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-xs text-gray-500 font-bold tracking-wider mb-1">
                TỔNG CHI
              </p>
              <h2 className="text-2xl font-black text-red-500">
                {totalOut.toLocaleString("vi-VN")} ₫
              </h2>
            </div>
            <div className="bg-slate-800 p-5 rounded-xl shadow-sm flex flex-col justify-center">
              <p className="text-xs text-slate-400 font-bold tracking-wider mb-1">
                TỒN QUỸ HIỆN TẠI
              </p>
              <h2
                className={`text-2xl font-black ${balance >= 0 ? "text-white" : "text-red-400"}`}
              >
                {balance.toLocaleString("vi-VN")} ₫
              </h2>
            </div>
          </div>

          {/* 2. CARD NỘI DUNG CHÍNH */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* HEADER CỦA CARD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                  <FaWallet className="text-blue-600" /> Sổ quỹ (Thu/Chi)
                </h2>
                <p className="text-sm text-gray-500">
                  Quản lý dòng tiền, các khoản thu chi nội bộ và bán hàng
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/pos")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 border border-gray-200"
                >
                  <FaCashRegister /> Quay lại POS
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      type: "IN",
                      category: "OTHER_IN",
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <FaPlus /> Lập phiếu thu
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      type: "OUT",
                      category: "EXPENSE",
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <FaMinus /> Lập phiếu chi
                </button>
              </div>
            </div>

            {/* THANH TÌM KIẾM & LỌC */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm theo mã phiếu..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-600 min-w-[180px]">
                <option value="">Tất cả loại phiếu</option>
                <option value="IN">Phiếu Thu</option>
                <option value="OUT">Phiếu Chi</option>
              </select>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-600 min-w-[180px]">
                <option value="">Tất cả trạng thái</option>
                <option value="COMPLETED">Đã hoàn thành</option>
              </select>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Mã Phiếu
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Loại / Hạng mục
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Người tạo
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Ghi chú
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-12 text-center text-sm text-gray-400"
                      >
                        Không tìm thấy phiếu nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                          {t.code}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(t.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-md ${
                              t.type === "IN"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-red-50 text-red-600 border border-red-100"
                            }`}
                          >
                            {t.type === "IN" ? "THU" : "CHI"} -{" "}
                            {translateCategory(t.category)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          {t.creator?.fullName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                          {t.note}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm font-bold text-right ${
                            t.type === "IN"
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {t.type === "IN" ? "+" : "-"}
                          {Number(t.amount).toLocaleString("vi-VN")} ₫
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL LẬP PHIẾU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h2
              className={`text-lg font-bold mb-5 ${formData.type === "IN" ? "text-emerald-600" : "text-red-600"}`}
            >
              LẬP PHIẾU {formData.type === "IN" ? "THU" : "CHI"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Loại mục
                </label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {formData.type === "IN" ? (
                    <>
                      <option value="OTHER_IN">Thu khác</option>
                    </>
                  ) : (
                    <>
                      <option value="EXPENSE">
                        Chi phí (Điện, nước, lương...)
                      </option>

                      <option value="OTHER_OUT">Chi khác</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-lg font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  rows="3"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Lý do thu/chi..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${
                    formData.type === "IN"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Lưu Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbookPage;
