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
  reason,
  setReason,
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
          allowedRoles: ["WAREHOUSE_STAFF", "MANAGER", "OWNER"],
        },
        {
          value: "EXPORT",
          label: "Phiếu Xuất (EXPORT)",
          allowedRoles: ["WAREHOUSE_STAFF", "MANAGER", "OWNER"],
        },
      ],
    },
  ];

  // 2. Mapping lý do chi tiết
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
      {/* HEADER ĐÃ ĐƯỢC TỐI ƯU CHIỀU CAO */}
      <div
        className={`p-4 pb-3 border-b border-dashed ${config.theme} transition-all duration-300`}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base font-black uppercase flex items-center gap-2">
              {config.icon} {config.label}
            </h2>
            <div className="flex items-center gap-1 text-xs font-medium opacity-80 mt-0.5 ml-1">
              <FaCalendarDays />
              <input
                type="date"
                className="bg-transparent border-b border-dashed border-gray-500 focus:border-blue-500 outline-none ml-1 cursor-pointer font-bold text-gray-700 w-[110px]"
                value={ticketDate}
                onChange={(e) => setTicketDate(e.target.value)}
              />
            </div>
          </div>

          <select
            className="text-xs font-bold uppercase bg-white/80 border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer max-w-[150px]"
            value={ticketType}
            onChange={(e) => {
              setTicketType(e.target.value);
              setReason("");
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

        {/* FORM FIELDS - RÚT GỌN LÊN 1 HÀNG */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            {/* Lý do */}
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-0.5 block">
                Lý do thực hiện <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setPartnerId("");
                  setTargetLocationId("");
                }}
              >
                <option value="">-- Chọn lý do --</option>
                {REASON_MAPPING[ticketType]
                  ?.filter((r) => {
                    // [ĐIỀU KIỆN MỚI]: Nếu là MANAGER và đang ở tab NHẬP KHO -> Chỉ hiển thị TRANSFER
                    if (userRole === "MANAGER" && ticketType === "IMPORT") {
                      return r.value === "TRANSFER";
                    }
                    if (userRole === "MANAGER" && ticketType === "EXPORT") {
                      return r.value === "TRANSFER";
                    }
                    // 2. Nếu là WAREHOUSE_STAFF (Thủ kho): Ẩn TRANSFER (Chuyển kho) và SELL (Xuất bán)
                    if (userRole === "WAREHOUSE_STAFF") {
                      return r.value !== "TRANSFER" && r.value !== "SELL";
                    }
                    // Các Role khác (OWNER, STAFF) hoặc ở tab EXPORT thì hiển thị đầy đủ
                    return true;
                  })
                  .map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
              </select>
            </div>
            {/* Kho Đích / Kho Nguồn */}
            {reason === "TRANSFER" && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5 block truncate">
                  {ticketType === "EXPORT" ? "Chuyển đến" : "Nhận từ"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
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

            {/* Đối Tác */}
            {["BUY", "SELL", "RETURN_FROM_CUST", "RETURN_TO_SUPP"].includes(
              reason,
            ) && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5 block truncate">
                  {["BUY", "RETURN_TO_SUPP"].includes(reason)
                    ? "Nhà Cung Cấp"
                    : "Khách Hàng"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                >
                  <option value="">-- Chọn --</option>
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
            )}
          </div>

          {/* Ghi chú */}
          <div className="animate-in fade-in slide-in-from-top-1">
            <textarea
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm resize-none transition-all placeholder-gray-400"
              placeholder="Ghi chú / Mô tả thêm (nếu có)..."
              rows="1"
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

                {/* Ô NHẬP HẠN SỬ DỤNG KHI LÀ PHIẾU NHẬP */}
                {ticketType === "IMPORT" && reason === "BUY" && (
                  <div className="mt-1 mb-2">
                    <input
                      type="text"
                      placeholder="HSD (dd/mm/yyyy)"
                      className="w-full max-w-[140px] text-xs px-2 py-1 bg-yellow-50 border border-yellow-200 rounded outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-400 font-medium"
                      value={item.expiryDate || ""}
                      onChange={(e) =>
                        onUpdateItem(
                          item.product.id,
                          "expiryDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}

                <div className="flex items-end justify-between mt-1">
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button
                      onClick={() => onAdjustQuantity(item.product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-gray-600 text-[10px]"
                    >
                      <FaMinus />
                    </button>
                    <input
                      className="w-8 text-center bg-transparent text-xs font-bold text-gray-800 outline-none"
                      value={`${item.quantity}`}
                      onChange={(e) =>
                        onUpdateItem(
                          item.product.id,
                          "quantity",
                          e.target.value,
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
