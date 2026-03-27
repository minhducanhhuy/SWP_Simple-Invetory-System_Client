// src/pages/POS/POSPage.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../context/LocationContext";
import { AuthContext } from "../../context/AuthContext";
import { getProducts } from "../../services/productService";
import { createInvoice } from "../../services/invoiceService";
import ReceiptModal from "./ReceiptModal";
import { getCustomers } from "../../services/customerService"; // <--- Import gọi API Khách hàng
import {
  FaCartShopping,
  FaMoneyBillWave,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowRightFromBracket,
  FaStore,
  FaUserPlus,
  FaFileInvoiceDollar,
} from "react-icons/fa6";

const POSPage = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]); // <--- State lưu Khách hàng
  const [selectedCustomerId, setSelectedCustomerId] = useState(""); // <--- State lưu Khách đang chọn

  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // 1. LẤY DANH SÁCH SẢN PHẨM & KHÁCH HÀNG
  const fetchData = async () => {
    if (currentLocation) {
      try {
        const [productData, customerData] = await Promise.all([
          getProducts({ locationId: currentLocation.id }),
          getCustomers(), // Lấy danh sách khách hàng
        ]);

        const availableProducts = productData.filter((p) => {
          // Chỉ lấy tồn kho của đúng chi nhánh đang đứng
          const localInv = p.inventory?.find(
            (inv) => inv.locationId === currentLocation.id,
          );
          const stock = p.currentStock || localInv?.quantity || 0;
          return stock > 0;
        });
        setProducts(availableProducts);
        setCustomers(customerData);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentLocation]);

  // Lọc sản phẩm theo từ khóa (Tìm kiếm thường, không dùng tít mã)
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  // 2. LOGIC GIỎ HÀNG
  const addToCart = (product) => {
    // Tìm đúng tồn kho của chi nhánh hiện tại
    const localInv = product.inventory?.find(
      (inv) => inv.locationId === currentLocation.id,
    );
    const stock = product.currentStock || localInv?.quantity || 0;
    setCart((prev) => {
      const exist = prev.find((item) => item.productId === product.id);
      if (exist) {
        if (exist.quantity >= stock) {
          alert(`Sản phẩm "${product.name}" chỉ còn ${stock} trong kho!`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.sellPrice),
          quantity: 1,
          maxStock: stock,
        },
        ...prev,
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (newQty > item.maxStock) {
            alert(`Kho chỉ còn ${item.maxStock} sản phẩm!`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((item) => item.productId !== productId));

  // 3. TÍNH TOÁN TIỀN
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const changeMoney = Number(amountPaid) - totalAmount;
  const quickCashOptions = [totalAmount, 50000, 100000, 200000, 500000].filter(
    (val) => val >= totalAmount && val > 0,
  );
  const uniqueQuickCash = [...new Set(quickCashOptions)].slice(0, 4);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");
    if (
      paymentMethod === "CASH" &&
      (amountPaid === "" || Number(amountPaid) < totalAmount)
    ) {
      return alert("Khách đưa chưa đủ tiền!");
    }

    setIsSubmitting(true);
    try {
      // 1. GỌI API LƯU DATABASE (Backend đẻ ra Hóa đơn + Phiếu xuất)
      const newInvoice = await createInvoice({
        locationId: currentLocation.id,
        customerId: selectedCustomerId || undefined,
        amountPaid: paymentMethod === "CASH" ? Number(amountPaid) : totalAmount,
        paymentMethod,
        details: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      // 2. LƯU DỮ LIỆU ĐỂ TRUYỀN VÀO TỜ BILL
      const selectedCustomer = customers.find(
        (c) => c.id === selectedCustomerId,
      );
      setCurrentInvoice({
        code: newInvoice.code, // Lấy mã Backend vừa tạo trả về
        date: new Date(),
        locationName: currentLocation.name,
        cashierName: user?.fullName || "Thu ngân",
        customerName: selectedCustomer
          ? selectedCustomer.name
          : "Khách vãng lai",
        cart: [...cart], // Copy y nguyên giỏ hàng hiện tại
        totalAmount,
        amountPaid: paymentMethod === "CASH" ? Number(amountPaid) : totalAmount,
        changeMoney: paymentMethod === "CASH" ? changeMoney : 0,
        paymentMethod,
      });

      // 3. HIỆN TỜ BILL LÊN
      setShowReceipt(true);

      // Mẹo: Ở đây chúng ta CHƯA xóa giỏ hàng vội. Đóng Bill xong mới xóa.
    } catch (error) {
      alert(
        "❌ Lỗi: " + (error.response?.data?.message || "Không thể thanh toán"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. HÀM ĐÓNG BILL & RESET QUẦY (Đón khách mới)
  const handleCloseReceipt = async () => {
    setShowReceipt(false);
    setCurrentInvoice(null);
    setCart([]);
    setAmountPaid("");
    setSearchTerm("");
    setSelectedCustomerId("");
    await fetchData(); // Cập nhật lại số tồn kho
  };

  const handleLogout = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn kết thúc ca làm việc và đăng xuất?")
    ) {
      logout();
      navigate("/login");
    }
  };

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 font-bold text-gray-500 text-xl">
        Đang kết nối chi nhánh thu ngân...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* HEADER POS */}
      <div className="bg-slate-800 text-white h-14 flex justify-between items-center px-4 shadow-md shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="font-black text-xl tracking-wider text-blue-400">
            SIM<span className="text-white">POS</span>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center gap-2 text-sm font-medium bg-slate-700 px-3 py-1 rounded-full text-blue-200">
            <FaStore /> {currentLocation.name}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            Ca làm việc:{" "}
            <span className="font-bold text-green-400">
              {user?.fullName || "Thu ngân"}
            </span>
          </div>

          {/* === THÊM NÚT NÀY CHO THU NGÂN XEM ĐỐI SOÁT === */}
          <button
            onClick={() => navigate("/invoices")}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition flex items-center gap-1.5 font-bold shadow-sm"
          >
            <FaFileInvoiceDollar /> Lịch sử & Giao ca
          </button>
          {/* ============================================= */}

          {user?.role !== "SALESPERSON" && (
            <button
              onClick={() => navigate("/")}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition"
            >
              Về trang Quản trị
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 p-2"
            title="Kết thúc ca (Đăng xuất)"
          >
            <FaArrowRightFromBracket size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* CỘT TRÁI: TÌM KIẾM & DANH SÁCH SẢN PHẨM */}
        <div className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Gõ tên sản phẩm hoặc mã SKU..."
              className="w-full px-4 py-4 text-lg font-medium rounded-xl border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1 custom-scrollbar pb-20">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all active:scale-95 flex flex-col h-32 relative overflow-hidden group"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {p.name}
                  </h3>
                  <div className="text-[10px] text-gray-400 mt-1 font-mono">
                    {p.sku}
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    Tồn: {p.currentStock || p.inventory?.[0]?.quantity || 0}
                  </span>
                  <span className="font-black text-blue-600 text-base">
                    {Number(p.sellPrice).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: HÓA ĐƠN & THANH TOÁN */}
        <div className="w-[420px] bg-white shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)] flex flex-col z-10 shrink-0">
          {/* KHU VỰC CHỌN KHÁCH HÀNG (ĐÁP ỨNG US14) */}
          <div className="px-5 py-3 border-b border-gray-200 bg-blue-50 flex items-center gap-3">
            <FaUserPlus className="text-blue-600 text-lg" />
            <select
              className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Khách vãng lai --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || "Không có SĐT"})
                </option>
              ))}
            </select>
          </div>

          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <FaCartShopping className="text-lg" />
              <h2 className="text-md font-black uppercase tracking-tight">
                Hóa đơn
              </h2>
            </div>
            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} món
            </span>
          </div>

          {/* Giỏ hàng */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                <FaCartShopping size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative pr-10"
                >
                  <span className="font-bold text-sm text-gray-800 leading-tight mb-2">
                    {item.name}
                  </span>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="px-2.5 py-1.5 hover:bg-white text-gray-600 transition-colors"
                      >
                        <FaMinus className="text-[10px]" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm bg-transparent outline-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="px-2.5 py-1.5 hover:bg-white text-gray-600 transition-colors"
                      >
                        <FaPlus className="text-[10px]" />
                      </button>
                    </div>
                    <span className="font-black text-blue-600 text-base">
                      {(item.unitPrice * item.quantity).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Khu vực Thanh toán */}
          <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">
                Tổng cần thanh toán
              </span>
              <span className="text-3xl font-black text-red-600 tracking-tighter leading-none">
                {totalAmount.toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {["CASH", "BANK_TRANSFER", "CARD"].map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentMethod(method);
                    setAmountPaid("");
                  }}
                  className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-lg border-2 transition-all ${
                    paymentMethod === method
                      ? "bg-blue-50 border-blue-600 text-blue-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {method === "CASH"
                    ? "Tiền mặt"
                    : method === "BANK_TRANSFER"
                      ? "Chuyển khoản"
                      : "Quẹt thẻ"}
                </button>
              ))}
            </div>

            {paymentMethod === "CASH" && (
              <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="font-bold text-gray-700">Khách đưa:</span>
                    <span
                      className={`font-bold text-lg ${changeMoney >= 0 ? "text-green-600" : "text-gray-400"}`}
                    >
                      Trả lại:{" "}
                      {amountPaid && changeMoney >= 0
                        ? changeMoney.toLocaleString("vi-VN")
                        : "---"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-3 text-right font-black text-xl border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Nhập số tiền..."
                  />
                </div>
                {totalAmount > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {uniqueQuickCash.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmountPaid(val)}
                        className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-lg transition-colors border border-gray-200"
                      >
                        {val.toLocaleString("vi-VN")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className={`w-full py-4 text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                cart.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
              }`}
            >
              <FaMoneyBillWave size={22} />
              {isSubmitting ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
            </button>
          </div>
        </div>
      </div>

      {/* HIỂN THỊ HÓA ĐƠN Ở ĐÂY */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={handleCloseReceipt}
        invoiceData={currentInvoice}
      />
    </div>
  );
};

export default POSPage;
