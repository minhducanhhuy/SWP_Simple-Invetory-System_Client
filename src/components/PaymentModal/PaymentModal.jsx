import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaTimes } from "react-icons/fa";

const PaymentModal = ({ isOpen, onClose, onSave, supplier, selectedTicket }) => {
  // --- STATE QUẢN LÝ DỮ LIỆU TRONG FORM ---
  const [amount, setAmount] = useState(0); // Giá trị số
  const [displayAmount, setDisplayAmount] = useState(""); // Chuỗi hiển thị (có dấu ,)
  const [productNamesStr, setProductNamesStr] = useState(""); // Lưu Tên SP hiển thị
  const [note, setNote] = useState(""); // Ghi chú

  // !!! TRÁI TIM CỦA LOGIC: useEffect SẼ CHẠY KHI MỞ MODAL HOẶC CÓ PHIẾU MỚI !!!
  useEffect(() => {
    if (isOpen) {
      // TRƯỜNG HỢP 1: THANH TOÁN THEO MỘT PHIẾU NHẬP CỤ THỂ
      if (selectedTicket && selectedTicket.isTicket) {
        // 1. Tự động điền số tiền từ phiếu nhập
        setAmount(selectedTicket.amount);
        setDisplayAmount(selectedTicket.amount.toLocaleString("en-US")); // "1,000,000"

        // 2. Tìm phiếu gốc trong supplier.tickets để lấy danh sách tên sản phẩm
        // API BE phải trả về detail có product: { name: '...', sku: '...' }
        const originalTicket = supplier?.tickets?.find(t => t.id === selectedTicket.id);
        
        if (originalTicket && originalTicket.details) {
          // Trích xuất TÊN sản phẩm, fallback về sku/code nếu chưa có name
          const names = originalTicket.details
            .map(detail => detail.product?.name || detail.product?.sku || "Sản phẩm")
            .filter(name => name);
          
          // Dùng Set để lọc trùng nếu nhập 2 dòng cùng 1 loại sản phẩm
          const uniqueNames = [...new Set(names)];
          
          // Gộp thành chuỗi, ví dụ: "Coca Cola, Pepsi"
          let displayName = uniqueNames.join(", ");
          
          // Rút gọn nếu danh sách tên quá dài (ví dụ > 3 sản phẩm)
          if (uniqueNames.length > 3) {
            displayName = `${uniqueNames.slice(0, 3).join(", ")} và ${uniqueNames.length - 3} SP khác`;
          }

          setProductNamesStr(displayName);
          
          // Tự động tạo câu ghi chú kế toán thân thiện
          setNote(`Thanh toán cho phiếu nhập ${selectedTicket.code}. Gồm: ${displayName}`);
        } else {
          setProductNamesStr("");
          setNote(`Thanh toán cho phiếu nhập ${selectedTicket.code}`);
        }
      } 
      // TRƯỜNG HỢP 2: TẠO PHIẾU CHI MỚI TINH TRÊN HEADER (THANH TOÁN CHUNG CHUNG)
      else {
        // Reset toàn bộ về 0/rỗng
        setAmount(0);
        setDisplayAmount("");
        setProductNamesStr("");
        setNote("");
      }
    }
  }, [isOpen, selectedTicket, supplier]);

  // Nếu modal không bật thì không render gì cả
  if (!isOpen) return null;

  // --- XỬ LÝ KHI GÕ SỐ TIỀN (Format dấu ,) ---
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Chỉ lấy ký tự số
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    
    if (!onlyNumbers) {
      setDisplayAmount("");
      setAmount(0);
      return;
    }
    
    // Đổi sang số
    const numericValue = parseInt(onlyNumbers, 10);
    setAmount(numericValue);
    // Format hiển thị cho người dùng (ví dụ gõ 1000 ra 1,000)
    setDisplayAmount(numericValue.toLocaleString("en-US"));
  };

  // --- XỬ LÝ KHI BẤM LƯU ---
  const handleSubmit = () => {
    // 1. Xác thực cơ bản: Phải nhập số tiền > 0
    if (amount <= 0) {
      return alert("Vui lòng nhập số tiền hợp lệ (lớn hơn 0).");
    }

    // 2. Xác thực theo Phiếu: Nếu đang thanh toán cho 1 phiếu cụ thể
    if (selectedTicket && selectedTicket.isTicket) {
      if (amount > selectedTicket.amount) {
        return alert(
          `Số tiền chi không được vượt quá giá trị của phiếu nhập này (${selectedTicket.amount.toLocaleString()} ₫)!`
        );
      }
    }
    
    // 3. Xác thực Tổng Nợ: Không cho phép chi trả dư so với tổng nợ thực tế của NCC
    // (Bao hàm cả trường hợp thanh toán chung trên Header)
    if (amount > supplier.debt) {
      return alert(
        `Số tiền chi không được vượt quá tổng nợ hiện tại của nhà cung cấp (${supplier.debt.toLocaleString()} ₫)!`
      );
    }

    // Nếu pass qua hết các lớp bảo vệ trên -> Gửi dữ liệu về Component cha để gọi API
    onSave({
      supplierId: supplier.id,
      amount: amount, 
      note: note, 
    });
  };

  return (
    // Overlay nền đen mờ
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      {/* Khối Modal chính */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {selectedTicket ? `Thanh toán phiếu: ${selectedTicket.code}` : "Lập Phiếu Chi"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <FaTimes />
          </button>
        </div>
        
        {/* Body Modal */}
        <div className="p-6 space-y-4">
          {/* Ô nhập Số tiền chi */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Số tiền chi (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border border-gray-200 p-2.5 rounded-lg text-xl font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="0"
              autoFocus
            />
          </div>

          {/* Ô hiển thị TÊN sản phẩm dạng Text chỉ đọc (NẾU CÓ) */}
          {productNamesStr && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Sản phẩm trong phiếu nhập
              </label>
              {/* Div hiển thị thay vì Input để tránh bị nhầm là ô gõ */}
              <div className="w-full border border-gray-100 p-2.5 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium italic break-words leading-relaxed">
                {productNamesStr}
              </div>
            </div>
          )}

          {/* Ô nhập Ghi chú kế toán */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Ghi chú kế toán</label>
            <textarea
              className="w-full border border-gray-200 p-2.5 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập nội dung ghi chú cho phiếu chi..."
            />
          </div>
        </div>
        
        {/* Footer Modal (Các nút bấm) */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2"
          >
            <FaMoneyBillWave /> Lưu Phiếu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;