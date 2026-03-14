// src/pages/StockTicket/components/TicketCart.jsx
import React, { useMemo, useContext, useEffect } from "react";
import {
  FaFloppyDisk,
  FaTruckArrowRight,
  FaCartShopping,
  FaRightLeft,
  FaCalendarDays,
  FaMinus,
  FaPlus,
  FaXmark,
  FaClipboardCheck,
  FaTrashCan,
  FaRotateLeft,
  FaUserTag,
  FaWarehouse,
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
}) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";

  // 1. Cấu hình danh sách Loại phiếu
  const TICKET_OPTIONS = [
    {
      group: "Nhập / Xuất Chính",
      options: [
        {
          value: "IMPORT",
          label: "Nhập Hàng NCC",
          allowedRoles: ["WAREHOUSE_STAFF"],
        },
        {
          value: "EXPORT",
          label: "Xuất Bán Lẻ",
          allowedRoles: ["WAREHOUSE_STAFF"],
        },
      ],
    },
    {
      group: "Kho & Nội Bộ",
      options: [
        {
          value: "TRANSFER",
          label: "Chuyển Kho",
          allowedRoles: ["MANAGER"],
        },
        {
          value: "ADJUSTMENT",
          label: "Kiểm Kê / Điều Chỉnh",
          allowedRoles: ["MANAGER"],
        },
      ],
    },
    {
      group: "Trả Hàng",
      options: [
        {
          value: "RETURN_TO_SUPP",
          label: "Trả Hàng NCC",
          allowedRoles: ["MANAGER"],
        },
        {
          value: "RETURN_FROM_CUST",
          label: "Khách Trả Hàng",
          allowedRoles: ["ADMIN_SYSTEM", "OWNER", "MANAGER", "SALESPERSON"],
        },
      ],
    },
  ];

  // [MỚI] Danh sách Lý do (Khớp với Enum ReasonCode Backend)
  const REASON_OPTIONS = [
    { value: "SCRAP", label: "Xuất Hủy (Hết hạn, vỡ...)" },
    { value: "INTERNAL_USE", label: "Xuất Dùng Nội Bộ" },
    { value: "GIFT", label: "Xuất Biếu Tặng" },
  ];

  // 2. Logic lọc quyền
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

  // 3. Tự động chọn loại phiếu hợp lệ đầu tiên nếu loại hiện tại bị ẩn
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

  const config = useMemo(() => {
    switch (ticketType) {
      case "IMPORT":
        return {
          theme: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <FaTruckArrowRight />,
          label: "Nhập Hàng NCC",
          requirePartner: true,
          partnerType: "SUPPLIER",
          partnerLabel: "Nhà Cung Cấp",
        };
      case "ADJUSTMENT":
        return {
          theme: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <FaClipboardCheck />,
          label: "Kiểm Kê / Điều Chỉnh",
          requireReason: true, // [MỚI] Cờ báo hiệu cần chọn lý do
        };
      case "SELL":
        return {
          theme: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <FaCartShopping />,
          label: "Xuất Bán Lẻ",
          requirePartner: true,
          partnerType: "CUSTOMER",
          partnerLabel: "Khách Hàng",
        };
      case "TRANSFER":
        return {
          theme: "bg-orange-50 text-orange-700 border-orange-200",
          icon: <FaRightLeft />,
          label: "Chuyển Kho",
          requireDest: true,
        };
      case "RETURN_TO_SUPP":
        return {
          theme: "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: <FaRotateLeft />,
          label: "Trả Hàng NCC",
          requirePartner: true,
          partnerType: "SUPPLIER",
          partnerLabel: "Nhà Cung Cấp",
        };
      case "RETURN_FROM_CUST":
        return {
          theme: "bg-teal-50 text-teal-700 border-teal-200",
          icon: <FaRotateLeft />,
          label: "Khách Trả Hàng",
          requirePartner: true,
          partnerType: "CUSTOMER",
          partnerLabel: "Khách Hàng Trả",
        };
      default:
        return { theme: "bg-gray-50", icon: null, label: "Phiếu Kho" };
    }
  }, [ticketType]);

  // Validate Submit
  function handleSubmitWithValidate() {
    if (config.requireDest && !targetLocationId) {
      return alert("Vui lòng chọn kho đích!");
    }
    if (config.requirePartner && !partnerId) {
      return alert(`Vui lòng chọn ${config.partnerLabel}!`);
    }
    if (config.requireReason && !reason) {
      return alert("Vui lòng chọn Lý do điều chỉnh!");
    }
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
            <div className="flex items-center gap-1 text-xs font-medium opacity-80 mt-1 ml-1">
              <FaCalendarDays /> {new Date().toLocaleDateString("vi-VN")}
            </div>
          </div>

          <select
            className="text-xs font-bold uppercase bg-white/80 border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer max-w-[160px]"
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
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
          {/* [MỚI] Dropdown Reason (Chỉ hiện cho ADJUSTMENT) */}
          {config.requireReason && (
            <div className="animate-in fade-in slide-in-from-top-1 bg-white/50 p-2 rounded-lg border border-purple-200/50">
              <label className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1 block">
                Lý do điều chỉnh <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-sm p-2 rounded-lg border border-purple-200 bg-white focus:ring-2 focus:ring-purple-400 outline-none shadow-sm text-purple-800 font-medium"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">-- Chọn lý do --</option>
                {REASON_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kho Đích */}
          {config.requireDest && (
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1 block">
                Chuyển đến kho
              </label>
              <select
                className="w-full text-sm p-2.5 rounded-xl border border-orange-200 bg-white focus:ring-2 focus:ring-orange-400 outline-none shadow-sm"
                value={targetLocationId}
                onChange={(e) => setTargetLocationId(e.target.value)}
              >
                <option value="">-- Chọn kho nhận hàng --</option>
                {otherLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Đối Tác */}
          {config.requirePartner && (
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1 block">
                {config.partnerLabel}
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  className="w-full text-sm p-2.5 pl-9 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                >
                  <option value="">-- Chọn đối tượng --</option>
                  {config.partnerType === "SUPPLIER"
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
              {/* Product Info... (Giữ nguyên như cũ) */}
              <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0 overflow-hidden border border-gray-100">
                <img
                  src={item.product.imageUrl || "https://placehold.co/50"}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {item.product.name}
                  </p>
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
                    <input
                      className="w-8 text-center bg-transparent text-xs font-bold text-gray-800 outline-none"
                      value={item.quantity}
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
