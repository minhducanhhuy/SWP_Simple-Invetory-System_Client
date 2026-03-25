import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

const ReceiptModal = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    window.print(); // Gọi hộp thoại máy in của trình duyệt
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Khung viền ngoài của Modal */}
      <div className="bg-gray-100 rounded-2xl shadow-2xl flex flex-col w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold">Xem trước hóa đơn</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* ========================================== */}
        {/* VÙNG IN HÓA ĐƠN (ID này khớp với CSS ở trên) */}
        {/* ========================================== */}
        <div className="p-6 overflow-y-auto bg-gray-200 flex justify-center custom-scrollbar max-h-[70vh]">
          <div
            id="receipt-print-area"
            className="bg-white w-[80mm] min-h-[100mm] p-4 text-black font-mono text-[12px] leading-tight shadow-md"
          >
            {/* Tên cửa hàng */}
            <div className="text-center mb-4">
              <h2 className="text-[18px] font-black uppercase mb-1">
                S.I.M MINI MART
              </h2>
              <p>ĐC: {invoiceData.locationName}</p>
              <p>HÓA ĐƠN THANH TOÁN</p>
              <p className="mt-1 font-bold">Mã HĐ: {invoiceData.code}</p>
            </div>

            <div className="border-b-2 border-dashed border-black mb-3 pb-2">
              <p>Ngày: {invoiceData.date.toLocaleString("vi-VN")}</p>
              <p>Thu ngân: {invoiceData.cashierName}</p>
              {invoiceData.customerName && (
                <p>Khách hàng: {invoiceData.customerName}</p>
              )}
            </div>

            {/* Danh sách món hàng */}
            <table className="w-full mb-3 text-left">
              <thead>
                <tr className="border-b-2 border-dashed border-black">
                  <th className="py-1">SL</th>
                  <th className="py-1 w-full pl-2">Tên món</th>
                  <th className="py-1 text-right">T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.cart.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 align-top font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2 align-top">
                      <div className="line-clamp-2">{item.name}</div>
                      <div className="text-[10px] text-gray-500">
                        {item.unitPrice.toLocaleString("vi-VN")}đ
                      </div>
                    </td>
                    <td className="py-2 align-top text-right font-bold">
                      {(item.quantity * item.unitPrice).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tổng kết tiền */}
            <div className="border-t-2 border-dashed border-black pt-3">
              <div className="flex justify-between items-center mb-1 text-[14px] font-black">
                <span>TỔNG CỘNG:</span>
                <span>{invoiceData.totalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span>P.Thức:</span>
                <span>
                  {invoiceData.paymentMethod === "CASH"
                    ? "Tiền mặt"
                    : invoiceData.paymentMethod === "CARD"
                      ? "Quẹt thẻ"
                      : "Chuyển khoản"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span>Khách đưa:</span>
                <span>{invoiceData.amountPaid.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Trả lại:</span>
                <span>{invoiceData.changeMoney.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            <div className="text-center mt-6 text-[11px] italic border-t-2 border-dashed border-black pt-3">
              <p>Cảm ơn quý khách và hẹn gặp lại!</p>
              <p>Hotline: 1900 xxxx</p>
            </div>
          </div>
        </div>

        {/* Nút In */}
        <div className="p-4 bg-white border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg flex items-center gap-2"
          >
            <FaPrint /> In Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
