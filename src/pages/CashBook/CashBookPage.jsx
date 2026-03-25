import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import {
  getCashTransactions,
  createCashTransaction,
} from "../../services/cashService";
import { FaPlus, FaMinus, FaMoneyBillWave } from "react-icons/fa";

const CashbookPage = () => {
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

  // Dịch mã Category sang Tiếng Việt
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
    return <div className="p-6">Vui lòng chọn chi nhánh...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <FaMoneyBillWave className="text-green-600" /> SỔ QUỸ CỬA HÀNG
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setFormData({ ...formData, type: "IN", category: "OTHER_IN" });
              setIsModalOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-md"
          >
            <FaPlus /> LẬP PHIẾU THU
          </button>
          <button
            onClick={() => {
              setFormData({ ...formData, type: "OUT", category: "EXPENSE" });
              setIsModalOpen(true);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 shadow-md"
          >
            <FaMinus /> LẬP PHIẾU CHI
          </button>
        </div>
      </div>

      {/* Thẻ Thống kê */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 font-bold mb-1">TỔNG THU</p>
          <h2 className="text-3xl font-black text-green-600">
            {totalIn.toLocaleString("vi-VN")} ₫
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-gray-500 font-bold mb-1">TỔNG CHI</p>
          <h2 className="text-3xl font-black text-red-500">
            {totalOut.toLocaleString("vi-VN")} ₫
          </h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 font-bold mb-1">TỒN QUỸ HIỆN TẠI</p>
          <h2
            className={`text-3xl font-black ${balance >= 0 ? "text-white" : "text-red-400"}`}
          >
            {balance.toLocaleString("vi-VN")} ₫
          </h2>
        </div>
      </div>

      {/* Bảng Lịch sử */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-bold">Mã Phiếu</th>
              <th className="p-4 font-bold">Thời gian</th>
              <th className="p-4 font-bold">Loại / Hạng mục</th>
              <th className="p-4 font-bold">Người tạo</th>
              <th className="p-4 font-bold">Ghi chú</th>
              <th className="p-4 font-bold text-right">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Chưa có giao dịch nào
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-sm font-bold text-gray-600">
                    {t.code}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(t.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${t.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {t.type === "IN" ? "THU" : "CHI"} -{" "}
                      {translateCategory(t.category)}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">
                    {t.creator?.fullName}
                  </td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                    {t.note}
                  </td>
                  <td
                    className={`p-4 font-black text-right ${t.type === "IN" ? "text-green-600" : "text-red-500"}`}
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

      {/* Modal Lập Phiếu */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 animate-in zoom-in-95">
            <h2
              className={`text-xl font-black mb-4 ${formData.type === "IN" ? "text-green-600" : "text-red-600"}`}
            >
              LẬP PHIẾU {formData.type === "IN" ? "THU" : "CHI"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Loại mục
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 outline-none"
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
                      <option value="IMPORT_PAY">Trả tiền nhà cung cấp</option>
                      <option value="OTHER_OUT">Chi khác</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-xl font-black outline-none focus:ring-2"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2"
                  rows="2"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Lý do thu/chi..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg font-bold shadow-md ${formData.type === "IN" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
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
