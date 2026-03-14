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

const REASON_MAP = {
  IMPORT: "BUY",
  SELL: "SELL",
  TRANSFER: "TRANSFER",
  RETURN_TO_SUPP: "RETURN_TO_SUPP",
  RETURN_FROM_CUST: "RETURN_FROM_CUST",
};

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocation();

  // --- STATE ---
  const [ticketType, setTicketType] = useState("IMPORT");
  const [reason, setReason] = useState(""); // [MỚI] State lý do
  const [note, setNote] = useState("");
  const [targetLocationId, setTargetLocationId] = useState("");
  const [partnerId, setPartnerId] = useState("");

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
        const [prods, locs] = await Promise.all([
          getProducts({ locationId: currentLocation.id }),
          getMyLocations(),
        ]);
        setProducts(prods);
        setOtherLocations(locs.filter((l) => l.id !== currentLocation.id));
      } catch (err) {
        console.error(err);
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

  // Logic Cart (Giữ nguyên)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowerSearch = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.sku.toLowerCase().includes(lowerSearch),
    );
  }, [products, searchTerm]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existItem = prev.find((item) => item.product.id === product.id);
      // Logic giá mặc định: Nhập -> Giá vốn, Xuất -> Giá bán, Điều chỉnh -> Giá vốn
      const defaultPrice =
        ticketType === "IMPORT" || ticketType === "EXPORT"
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
    const finalReason =
      ticketType === "ADJUSTMENT" ? reason : REASON_MAP[ticketType];
    if (!currentLocation) return alert("Chưa chọn kho làm việc!");
    if (cart.length === 0) return alert("Phiếu chưa có sản phẩm nào!");

    // Validate Reason nếu là ADJUSTMENT
    if (ticketType === "ADJUSTMENT" && !reason) {
      return alert("Vui lòng chọn Lý do điều chỉnh!");
    }

    const details = cart.map((item) => ({
      productId: item.product.id,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));
    //sửa payload để có reason
    const payload = {
      type: ticketType,
      reason: finalReason,
      note,
      status: "COMPLETED",
      details,
    };
    switch (ticketType) {
      case "IMPORT":
        payload.destLocationId = currentLocation.id;
        payload.supplierId = partnerId;
        break;
      case "RETURN_FROM_CUST":
        payload.destLocationId = currentLocation.id;
        payload.customerId = partnerId;
        break;
      case "SELL":
        payload.sourceLocationId = currentLocation.id;
        payload.customerId = partnerId;
        break;
      case "RETURN_TO_SUPP":
        payload.sourceLocationId = currentLocation.id;
        payload.supplierId = partnerId;
        break;
      case "TRANSFER":
        payload.sourceLocationId = currentLocation.id;
        payload.destLocationId = targetLocationId;
        break;
      case "ADJUSTMENT": // Bao gồm SCRAP, INTERNAL_USE, GIFT (qua Reason)
        payload.sourceLocationId = currentLocation.id;
        break;
      default:
        break;
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
        setTicketType={(type) => {
          setTicketType(type);

          if (type === "ADJUSTMENT") {
            setReason("");
          } else {
            setReason(REASON_MAP[type] || "");
          }

          setCart([]);
          setPartnerId("");
          setTargetLocationId("");
        }}
        // [MỚI] Truyền props reason
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
