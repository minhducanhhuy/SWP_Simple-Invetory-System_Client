// src/pages/StockTicket/CreateTicketPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getMyLocations } from "../../services/locationService";
import { createStockTicket } from "../../services/stockTicketService";
import { getSuppliers } from "../../services/supplierService";
import { getCustomers } from "../../services/customerService";
import TicketCatalog from "./components/TicketCatalog";
import TicketCart from "./components/TicketCart";
import { useLocation } from "../../context/LocationContext";
import { getAllActiveLocations } from "../../services/locationService";

// [ĐÃ XÓA] TICKET_TYPE_MAP và REASON_MAP cũ vì không còn cần thiết nữa.
// Dữ liệu từ TicketCart truyền lên đã chuẩn 100% so với Database.

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocation();

  // --- STATE ---
  const [ticketType, setTicketType] = useState("IMPORT"); // Chỉ còn IMPORT hoặc EXPORT
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [targetLocationId, setTargetLocationId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  // Cạnh chỗ khai báo ticketType, reason...
  const [ticketDate, setTicketDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [products, setProducts] = useState([]);
  const [otherLocations, setOtherLocations] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // API Calls (Giữ nguyên)
  useEffect(() => {
    const initData = async () => {
      if (!currentLocation) return;
      try {
        const [prods, locsResponse] = await Promise.all([
          getProducts({ locationId: currentLocation.id }),
          getAllActiveLocations(),
        ]);

        // 1. Tùy thuộc vào cách bạn setup Axios, dữ liệu mảng có thể nằm trong locsResponse.data
        const locs = Array.isArray(locsResponse)
          ? locsResponse
          : locsResponse?.data || [];

        console.log("👉 [DEBUG] Kho hiện tại ID:", currentLocation.id);
        console.log("👉 [DEBUG] Tất cả kho từ API:", locs);

        // 2. Lọc bỏ kho hiện tại đang đứng
        const filteredLocs = locs.filter((l) => l.id !== currentLocation.id);
        console.log("👉 [DEBUG] Kho đích sau khi lọc:", filteredLocs);

        setProducts(prods);
        console.log("👉 [KIỂM TRA SẢN PHẨM]:", prods[0]); // <--- THÊM DÒNG NÀY
        setOtherLocations(locs.filter((l) => l.id !== currentLocation.id));
      } catch (error) {
        console.error("❌ [LỖI TẢI DỮ LIỆU KHO]:", error);
      }
    };
    initData();
  }, [currentLocation]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const [supData, cusData] = await Promise.all([
          getSuppliers(),
          getCustomers(),
        ]);

        setSuppliers(supData);
        setCustomers(cusData);
      } catch (error) {
        console.error("Lỗi tải danh sách đối tác:", error);
      }
    };
    fetchPartners();
  }, []);

  // Logic Cart
  // const filteredProducts = useMemo(() => {
  //   if (!searchTerm) return products;
  //   const lowerSearch = searchTerm.toLowerCase();
  //   return products.filter(
  //     (p) =>
  //       p.name.toLowerCase().includes(lowerSearch) ||
  //       p.sku.toLowerCase().includes(lowerSearch),
  //   );
  // }, [products, searchTerm]);
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. LỌC THEO TÊN (Search)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.sku.toLowerCase().includes(lowerSearch),
      );
    }

    // 2. LỌC THEO NHÀ CUNG CẤP (Chỉ kích hoạt khi là phiếu IMPORT MUA HÀNG)
    if (ticketType === "IMPORT" && reason === "BUY" && partnerId) {
      // Nó sẽ tự động giấu hết các sản phẩm không thuộc NCC này đi
      result = result.filter((p) => p.supplierId === partnerId);
    }

    return result;
  }, [products, searchTerm, ticketType, reason, partnerId]);
  const addToCart = (product) => {
    setCart((prev) => {
      const existItem = prev.find((item) => item.product.id === product.id);
      // [CẬP NHẬT] Logic giá đơn giản hơn: IMPORT -> Giá vốn, EXPORT -> Giá bán
      const defaultPrice =
        ticketType === "IMPORT"
          ? Number(product.costPrice)
          : Number(product.sellPrice);

      if (existItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prev, { product, quantity: 1, price: defaultPrice }];
      }
    });
  };

  const updateCartItem = (productId, field, value) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        if (field === "quantity" && Number(value) < 1) return item;
        return { ...item, [field]: value };
      }),
    );
  };

  const adjustQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!currentLocation) return alert("Chưa chọn kho làm việc!");
    if (cart.length === 0) return alert("Phiếu chưa có sản phẩm nào!");
    if (!reason) return alert("Vui lòng chọn Lý do thực hiện phiếu!");

    const details = cart.map((item) => ({
      productId: item.product.id,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));
    console.log(details);
    // 1. Tạo Payload gốc (Khớp 100% với DTO ở NestJS)
    const payload = {
      type: ticketType,
      reason: reason,
      note,
      status: "COMPLETED",
      date: new Date(ticketDate).toISOString(), // <--- Bổ sung dòng này để gửi ngày lên
      details,
    };

    // 2. [CẬP NHẬT LỚN] Đổ dữ liệu ID Kho và Đối tác cực kỳ thông minh
    if (ticketType === "IMPORT") {
      payload.destLocationId = currentLocation.id; // Kho nhận là kho hiện tại

      if (reason === "BUY") payload.supplierId = partnerId;
      if (reason === "RETURN_FROM_CUST") payload.customerId = partnerId;
      if (reason === "TRANSFER") payload.sourceLocationId = targetLocationId; // Nhận hàng chuyển từ kho khác đến
    } else if (ticketType === "EXPORT") {
      payload.sourceLocationId = currentLocation.id; // Kho xuất là kho hiện tại

      if (reason === "SELL") payload.customerId = partnerId;
      if (reason === "RETURN_TO_SUPP") payload.supplierId = partnerId;
      if (reason === "TRANSFER") payload.destLocationId = targetLocationId; // Xuất chuyển đi kho khác
    }

    try {
      await createStockTicket(payload);
      alert("Tạo phiếu thành công!");
      navigate("/stock-tickets");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi tạo phiếu");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100/50 font-sans overflow-hidden">
      <TicketCatalog
        products={filteredProducts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddToCart={addToCart}
        ticketType={ticketType}
        navigate={navigate}
      />

      <TicketCart
        cart={cart}
        ticketType={ticketType}
        ticketDate={ticketDate}
        setTicketDate={setTicketDate}
        setTicketType={(type) => {
          setTicketType(type);
          setReason("");
          setCart([]);
          setPartnerId("");
          setTargetLocationId("");
        }}
        reason={reason}
        setReason={setReason}
        note={note}
        setNote={setNote}
        targetLocationId={targetLocationId}
        setTargetLocationId={setTargetLocationId}
        partnerId={partnerId}
        setPartnerId={setPartnerId}
        otherLocations={otherLocations}
        suppliers={suppliers}
        customers={customers}
        onUpdateItem={updateCartItem}
        onAdjustQuantity={adjustQuantity}
        onRemoveItem={removeFromCart}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateTicketPage;
