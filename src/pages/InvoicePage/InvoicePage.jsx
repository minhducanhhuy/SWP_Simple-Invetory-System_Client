import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import { getInvoicesByLocation } from "../../services/invoiceService";
import ReceiptModal from "../POSPage/ReceiptModal";
import {
  FaFileInvoiceDollar,
  FaSearch,
  FaPrint,
  FaCashRegister,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const InvoiceListPage = () => {
  const navigate = useNavigate(); // <--- Khai báo biến này
  const { currentLocation } = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý việc In lại Bill
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (currentLocation) {
        try {
          const data = await getInvoicesByLocation(currentLocation.id);
          setInvoices(data);
        } catch (error) {
          console.error("Lỗi tải hóa đơn:", error);
        }
      }
    };
    fetchInvoices();
  }, [currentLocation]);

  // Bộ lọc tìm kiếm
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // === LOGIC TÍNH TOÁN ĐỐI SOÁT GIAO CA ===
  const totalOrders = filteredInvoices.length;
  const totalRevenue = filteredInvoices.reduce(
    (sum, inv) => sum + Number(inv.amountPaid),
    0,
  );

  // Bóc tách từng loại tiền để Thu ngân đếm két
  const totalCash = filteredInvoices
    .filter((inv) => inv.paymentMethod === "CASH")
    .reduce((sum, inv) => sum + Number(inv.amountPaid), 0);

  const totalTransfer = filteredInvoices
    .filter(
      (inv) =>
        inv.paymentMethod === "BANK_TRANSFER" || inv.paymentMethod === "CARD",
    )
    .reduce((sum, inv) => sum + Number(inv.amountPaid), 0);

  // Xử lý mở Bill để xem/in lại
  const handleViewReceipt = (invoice) => {
    const formattedData = {
      code: invoice.code,
      date: new Date(invoice.createdAt),
      locationName: invoice.location?.name || currentLocation.name,
      cashierName: invoice.creator?.fullName || "Thu ngân",
      customerName: invoice.customer?.name || "Khách vãng lai",
      totalAmount: Number(invoice.totalAmount),
      amountPaid: Number(invoice.amountPaid),
      changeMoney: Number(invoice.amountPaid) - Number(invoice.totalAmount),
      paymentMethod: invoice.paymentMethod,
      cart:
        invoice.details?.map((d) => ({
          name: d.product.name,
          quantity: d.quantity,
          unitPrice: Number(d.unitPrice),
        })) || [],
    };

    setSelectedInvoiceData(formattedData);
    setIsReceiptOpen(true);
  };

  if (!currentLocation)
    return <div className="p-6">Vui lòng chọn chi nhánh...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <FaFileInvoiceDollar className="text-blue-600" /> QUẢN LÝ HÓA ĐƠN &
          GIAO CA
        </h1>

        {/* Gom thanh tìm kiếm và nút bấm vào một cụm flex */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/pos")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95"
          >
            <FaCashRegister /> Quay lại POS
          </button>

          <div className="relative w-72">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, tên khách..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KHU VỰC BÁO CÁO ĐỐI SOÁT / GIAO CA */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 font-bold mb-1 text-xs tracking-wider">
            TỔNG SỐ ĐƠN
          </p>
          <h2 className="text-2xl font-black text-gray-800">
            {totalOrders} <span className="text-sm font-medium">đơn</span>
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 font-bold mb-1 text-xs tracking-wider">
            DOANH THU TỔNG
          </p>
          <h2 className="text-2xl font-black text-green-600">
            {totalRevenue.toLocaleString("vi-VN")} ₫
          </h2>
        </div>

        {/* Thẻ này để Thu ngân đếm tiền thật trong két */}
        <div className="bg-amber-50 p-5 rounded-2xl shadow-sm border-l-4 border-amber-500">
          <p className="text-amber-700 font-bold mb-1 text-xs tracking-wider">
            TIỀN MẶT TRONG KÉT
          </p>
          <h2 className="text-2xl font-black text-amber-600">
            {totalCash.toLocaleString("vi-VN")} ₫
          </h2>
        </div>

        {/* Thẻ này để Sếp check app ngân hàng xem tiền vào chưa */}
        <div className="bg-purple-50 p-5 rounded-2xl shadow-sm border-l-4 border-purple-500">
          <p className="text-purple-700 font-bold mb-1 text-xs tracking-wider">
            CHUYỂN KHOẢN/THẺ
          </p>
          <h2 className="text-2xl font-black text-purple-600">
            {totalTransfer.toLocaleString("vi-VN")} ₫
          </h2>
        </div>
      </div>

      {/* BẢNG DANH SÁCH HÓA ĐƠN */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-bold">Mã HĐ</th>
              <th className="p-4 font-bold">Thời gian</th>
              <th className="p-4 font-bold">Khách hàng</th>
              <th className="p-4 font-bold">Thu ngân</th>
              <th className="p-4 font-bold">Phương thức</th>
              <th className="p-4 font-bold text-right">Tổng thanh toán</th>
              <th className="p-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-400">
                  Không tìm thấy hóa đơn nào
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-sm font-bold text-blue-600">
                    {inv.code}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(inv.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-4 text-sm font-medium">
                    {inv.customer?.name || (
                      <span className="text-gray-400 italic">
                        Khách vãng lai
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {inv.creator?.fullName}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        inv.paymentMethod === "CASH"
                          ? "bg-green-100 text-green-700"
                          : inv.paymentMethod === "CARD"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {inv.paymentMethod === "CASH"
                        ? "Tiền mặt"
                        : inv.paymentMethod === "CARD"
                          ? "Quẹt thẻ"
                          : "Chuyển khoản"}
                    </span>
                  </td>
                  <td className="p-4 font-black text-right text-red-500">
                    {Number(inv.amountPaid).toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleViewReceipt(inv)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition tooltip"
                      title="Xem & In lại Bill"
                    >
                      <FaPrint size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoiceData={selectedInvoiceData}
      />
    </div>
  );
};

export default InvoiceListPage;
