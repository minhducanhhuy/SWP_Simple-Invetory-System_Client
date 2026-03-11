import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaTimes } from "react-icons/fa";

const PaymentModal = ({ isOpen, onClose, onSave, supplier }) => {
  // State lưu số thật để gửi API (ví dụ: 1000000)
  const [amount, setAmount] = useState(0);
  // State lưu chuỗi hiển thị có dấu phẩy (ví dụ: "1,000,000")
  const [displayAmount, setDisplayAmount] = useState(""); 
  
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setDisplayAmount(""); // Reset cả chuỗi hiển thị khi mở modal
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Hàm xử lý khi người dùng gõ vào ô số tiền
  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Loại bỏ mọi ký tự không phải là số
    const onlyNumbers = value.replace(/[^0-9]/g, "");

    if (!onlyNumbers) {
      setDisplayAmount("");
      setAmount(0);
      return;
    }

    // Ép kiểu về số nguyên
    const numericValue = parseInt(onlyNumbers, 10);
    
    // Lưu số thật vào state amount
    setAmount(numericValue);
    
    // Format thành chuỗi có dấu phẩy và hiển thị ra UI
    setDisplayAmount(numericValue.toLocaleString("en-US"));
  };

  const handleSubmit = () => {
    if (amount <= 0) return alert("Số tiền phải lớn hơn 0");
    onSave({
      supplierId: supplier.id,
      amount: amount, // Truyền trực tiếp state amount (đã là số)
      note: note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Lập Phiếu Chi</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FaTimes />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Số tiền chi (VNĐ)
            </label>
            <input
              type="text"         // 1. ĐỔI THÀNH text
              inputMode="numeric" // 2. THÊM inputMode để hiện bàn phím số
              className="w-full border p-2 rounded text-lg font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={displayAmount} // 3. GẮN giá trị hiển thị có dấu phẩy
              onChange={handleAmountChange} // 4. GỌI hàm xử lý format
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              className="w-full border p-2 rounded h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded text-gray-700 font-medium hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 rounded text-white font-bold hover:bg-blue-700"
          >
            Lưu Phiếu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;