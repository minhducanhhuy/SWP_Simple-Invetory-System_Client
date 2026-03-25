import React from "react";
import { FaMagnifyingGlass, FaBoxOpen } from "react-icons/fa6";

const TicketCatalog = ({
  products,
  searchTerm,
  setSearchTerm,
  onAddToCart,
  ticketType,
}) => {
  // Helper format tiền
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200 shrink-0">
        <div className="relative flex-1 group">
          <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm font-medium"
            placeholder="Tìm sản phẩm theo Tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaBoxOpen className="text-3xl opacity-50" />
            </div>
            <p className="font-medium">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => onAddToCart(p)}
                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all group flex flex-col h-full relative overflow-hidden"
              >
                {/* Image Area */}
                <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                  <img
                    src={p.imageUrl || "https://placehold.co/200?text=No+Img"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/200?text=Err")
                    }
                  />
                  {/* Badge Stock */}
                  <div
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm ${
                      p.currentStock > 0
                        ? "bg-green-500/90 text-white"
                        : "bg-red-500/90 text-white"
                    }`}
                  >
                    Kho: {p.currentStock}
                  </div>
                </div>

                {/* Info Area */}
                <div className="flex flex-col flex-1">
                  <h4 className="font-semibold text-gray-700 text-sm line-clamp-2 leading-snug mb-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-mono mb-2">
                    {p.sku}
                  </p>

                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {p.unit?.name}
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatMoney(
                        ticketType === "IMPORT" ? p.costPrice : p.sellPrice,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCatalog;
