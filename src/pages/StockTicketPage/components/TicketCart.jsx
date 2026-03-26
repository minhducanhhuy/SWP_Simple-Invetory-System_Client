// src/pages/StockTicket/components/TicketCart.jsx
import React, { useMemo, useContext, useEffect } from "react";
import {
  FaFloppyDisk,
  FaTruckArrowRight,
  FaCartShopping,
  FaCalendarDays,
  FaMinus,
  FaPlus,
  FaXmark,
  FaUserTag,
} from "react-icons/fa6";
import { AuthContext } from "../../../context/AuthContext";

const TicketCart = ({
  cart,
  ticketType,
  setTicketType,
  reason, // Props reason từ Cha truyền xuống
  setReason, // Hàm setReason từ Cha truyền xuống
  note,
  setNote,
  targetLocationId,
  setTargetLocationId,
  partnerId,
  setPartnerId,
  otherLocations,
  suppliers = [],
  customers = [],
  onUpdateItem,
  onAdjustQuantity,
  onRemoveItem,
  onSubmit,
  ticketDate,
  setTicketDate,
}) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";

  // 1. Chỉ còn 2 loại phiếu chính
  const TICKET_OPTIONS = [
    {
      group: "Loại Phiếu Kho",
      options: [
        {
          value: "IMPORT",
          label: "Phiếu Nhập (IMPORT)",
          allowedRoles: ["WAREHOUSE_STAFF", "MANAGER", "ADMIN_SYSTEM", "OWNER"],
        },
        {
          value: "EXPORT",
          label: "Phiếu Xuất (EXPORT)",
          allowedRoles: ["WAREHOUSE_STAFF", "MANAGER", "ADMIN_SYSTEM", "OWNER"],
        },
      ],
    },
  ];

  // 2. Mapping lý do chi tiết (Khớp 100% với Enum DB)
  const REASON_MAPPING = {
    IMPORT: [
      { value: "BUY", label: "Nhập mua hàng" },
      { value: "RETURN_FROM_CUST", label: "Khách trả hàng" },
      { value: "TRANSFER", label: "Nhận chuyển kho" },
      { value: "ADJUSTMENT", label: "Điều chỉnh kho (Tăng)" },
    ],
    EXPORT: [
      { value: "SELL", label: "Xuất bán hàng" },
      { value: "RETURN_TO_SUPP", label: "Trả hàng NCC" },
      { value: "SCRAP", label: "Xuất hủy (Vỡ, hỏng...)" },
      { value: "INTERNAL_USE", label: "Dùng nội bộ" },
      { value: "GIFT", label: "Xuất biếu tặng" },
      { value: "TRANSFER", label: "Xuất chuyển kho" },
      { value: "ADJUSTMENT", label: "Điều chỉnh kho (Giảm)" },
    ],
  };

  const availableOptions = useMemo(() => {
    return TICKET_OPTIONS.map((group) => ({
      ...group,
      options: group.options.filter(
        (opt) =>
          opt.allowedRoles.includes("ANY") ||
          opt.allowedRoles.includes(userRole),
      ),
    })).filter((group) => group.options.length > 0);
  }, [userRole]);

  // Tự động gán loại phiếu mặc định nếu mảng options thay đổi
  useEffect(() => {
    if (availableOptions.length > 0) {
      const flatOptions = availableOptions.flatMap((g) =>
        g.options.map((o) => o.value),
      );
      if (!flatOptions.includes(ticketType)) {
        setTicketType(flatOptions[0]);
      }
    }
  }, [availableOptions, ticketType, setTicketType]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0,
  );
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // 3. UI Config cơ bản
  const config = useMemo(() => {
    switch (ticketType) {
      case "IMPORT":
        return {
          theme: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <FaTruckArrowRight />,
          label: "Nhập Kho",
        };
      case "EXPORT":
        return {
          theme: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <FaCartShopping />,
          label: "Xuất Kho",
        };
      default:
        return { theme: "bg-gray-50", icon: null, label: "Phiếu Kho" };
    }
  }, [ticketType]);

  // 4. Validate trước khi bấm Hoàn Tất
  function handleSubmitWithValidate() {
    if (!reason) return alert("Vui lòng chọn Lý do thực hiện phiếu!");
    if (reason === "TRANSFER" && !targetLocationId)
      return alert("Vui lòng chọn Kho Đích / Kho Nguồn!");
    if (["BUY", "RETURN_TO_SUPP"].includes(reason) && !partnerId)
      return alert("Vui lòng chọn Nhà cung cấp!");
    if (["SELL", "RETURN_FROM_CUST"].includes(reason) && !partnerId)
      return alert("Vui lòng chọn Khách hàng!");
    onSubmit();
  }

  return (
    <div className="w-[420px] bg-white flex flex-col border-l border-gray-200 shadow-2xl z-20 shrink-0 relative">
      {/* HEADER */}
      <div
        className={`p-5 border-b border-dashed ${config.theme} transition-all duration-300`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-black uppercase flex items-center gap-2">
              {config.icon} {config.label}
            </h2>
            {/* <div className="flex items-center gap-1 text-xs font-medium opacity-80 mt-1 ml-1">
              <FaCalendarDays /> {new Date().toLocaleDateString("vi-VN")} */}

            <div className="flex items-center gap-1 text-xs font-medium opacity-80 mt-1 ml-1">
              <FaCalendarDays />
              <input
                type="date"
                className="bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 outline-none ml-1 cursor-pointer font-bold text-gray-700"
                value={ticketDate}
                onChange={(e) => setTicketDate(e.target.value)}
              />
            </div>
          </div>

          <select
            className="text-xs font-bold uppercase bg-white/80 border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer max-w-[160px]"
            value={ticketType}
            onChange={(e) => {
              setTicketType(e.target.value);
              setReason(""); // Khi đổi Nhập/Xuất thì reset Lý do
              setPartnerId("");
              setTargetLocationId("");
            }}
          >
            {availableOptions.map((group, idx) => (
              <optgroup key={idx} label={group.group}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* FORM FIELDS */}
        <div className="space-y-3">
          {/* --- DROPDOWN LÝ DO Ở ĐÂY --- */}
          <div className="animate-in fade-in slide-in-from-top-1 bg-white/50 p-2 rounded-lg border border-gray-200 shadow-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1 block">
              Lý do thực hiện <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                // Đổi lý do thì tự reset form bên dưới để tránh chọn nhầm dữ liệu cũ
                setPartnerId("");
                setTargetLocationId("");
              }}
            >
              <option value="">-- Chọn lý do --</option>
              {REASON_MAPPING[ticketType]?.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kho Đích / Kho Nguồn (CHỈ HIỆN KHI CHỌN CHUYỂN KHO) */}
          {reason === "TRANSFER" && (
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1 block">
                {ticketType === "EXPORT" ? "Chuyển đến kho" : "Nhận từ kho"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                value={targetLocationId}
                onChange={(e) => setTargetLocationId(e.target.value)}
              >
                <option value="">-- Chọn kho --</option>
                {otherLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Đối Tác (CHỈ HIỆN KHI MUA, BÁN VÀ TRẢ HÀNG) */}
          {["BUY", "SELL", "RETURN_FROM_CUST", "RETURN_TO_SUPP"].includes(
            reason,
          ) && (
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1 block">
                {["BUY", "RETURN_TO_SUPP"].includes(reason)
                  ? "Nhà Cung Cấp"
                  : "Khách Hàng"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  className="w-full text-sm p-2.5 pl-9 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                >
                  <option value="">-- Chọn đối tượng --</option>
                  {["BUY", "RETURN_TO_SUPP"].includes(reason)
                    ? suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    : customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                </select>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1 block">
              Ghi chú / Mô tả
            </label>
            <textarea
              className="w-full text-sm p-3 rounded-xl border-none bg-white/60 focus:bg-white ring-1 ring-black/5 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm resize-none transition-all placeholder-gray-400"
              placeholder="Nhập ghi chú phiếu..."
              rows="2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              {config.icon}
            </div>
            <p className="text-sm font-medium">Chưa chọn sản phẩm</p>
          </div>
        ) : (
          cart.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 group"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0 overflow-hidden border border-gray-100">
                <img
                  src={item.product.imageUrl || "https://placehold.co/50"}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  {/* BỔ SUNG ĐƠN VỊ TÍNH VÀO DƯỚI TÊN SẢN PHẨM */}
                  <div>
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {item.product.name}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] uppercase font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                      ĐVT: {item.product.unit?.name || "N/A"}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <FaXmark />
                  </button>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button
                      onClick={() => onAdjustQuantity(item.product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-gray-600 text-[10px]"
                    >
                      <FaMinus />
                    </button>
                    {/* ĐÃ FIX LỖI THỪA CHỮ "unit" TRONG HÀM onUpdateItem */}
                    <input
                      className="w-8 text-center bg-transparent text-xs font-bold text-gray-800 outline-none"
                      value={`${item.quantity}`}
                      onChange={(e) =>
                        onUpdateItem(
                          item.product.id,
                          "quantity",
                          e.target.value, // Xóa chữ "unit" thừa ở đây đi, nếu không giỏ hàng sẽ vỡ nát!
                        )
                      }
                    />
                    <button
                      onClick={() => onAdjustQuantity(item.product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-blue-600 text-[10px]"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600 leading-none">
                      {formatMoney(item.quantity * item.price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="p-5 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-gray-500">Số lượng:</span>
          <span className="font-bold text-gray-800">
            {cart.reduce((sum, i) => sum + Number(i.quantity), 0)}
          </span>
        </div>
        <div className="flex justify-between items-end mb-5">
          <span className="text-gray-500 font-medium pb-1">Tổng cộng:</span>
          <span className="text-3xl font-black text-blue-600 tracking-tight">
            {formatMoney(totalAmount)}
          </span>
        </div>

        <button
          onClick={handleSubmitWithValidate}
          disabled={cart.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            cart.length > 0
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:to-blue-600 shadow-blue-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FaFloppyDisk /> HOÀN TẤT
        </button>
      </div>
    </div>
  );
};

export default TicketCart;
