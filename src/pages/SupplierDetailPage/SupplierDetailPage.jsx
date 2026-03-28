import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaTrash,
} from "react-icons/fa";
import {
  createSupplierPayment,
  deleteSupplierPayment,
} from "../../services/supplierPaymentService";
import api from "../../services/api";
import PaymentModal from "../../components/PaymentModal/PaymentModal"; // Chú ý đường dẫn đến Modal

const SupplierDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State lưu thông tin nhà cung cấp
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. STATE QUẢN LÝ MODAL VÀ DỮ LIỆU PHIẾU ---
  // State 1: Kiểm soát bật/tắt Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  // State 2: Lưu thông tin phiếu đang được chọn để thanh toán (null = tạo mới)
  const [selectedTicketToPay, setSelectedTicketToPay] = useState(null);

  // Hàm tải chi tiết nhà cung cấp
  const fetchDetail = async () => {
    setLoading(true);
    try {
      // Lấy ID kho
      const currentLocationId =
        localStorage.getItem("active_location_id") || "";
      const query = currentLocationId ? `?locationId=${currentLocationId}` : "";

      // Gọi API có đính kèm Query lọc theo kho
      const response = await api.get(`/suppliers/${id}${query}`);
      setSupplier(response.data);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      alert("Không tìm thấy nhà cung cấp");
      navigate("/suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  // --- 2. XỬ LÝ SỰ KIỆN THANH TOÁN ---
  const handleCreatePayment = async (paymentData) => {
    try {
      const currentLocationId = localStorage.getItem("active_location_id");
      if (!currentLocationId) {
        return alert(
          "Vui lòng chọn Kho làm việc trên thanh Header trước khi tạo phiếu chi!",
        );
      }

      // Gộp thêm locationId vào dữ liệu từ Modal gửi lên
      const payload = {
        ...paymentData,
        locationId: currentLocationId,
      };

      // Gửi payload mới này cho Backend
      await createSupplierPayment(payload);
      alert("Thanh toán thành công!");

      // Đóng modal và reset dữ liệu phiếu đã chọn
      setIsPayModalOpen(false);
      setSelectedTicketToPay(null);
      fetchDetail(); // Reload lại để cập nhật công nợ
    } catch (error) {
      const errMsg = error.response?.data?.message;
      alert(Array.isArray(errMsg) ? errMsg[0] : errMsg || "Lỗi thanh toán");
    }
  };

  // --- 3. XỬ LÝ SỰ KIỆN XÓA (HỦY) PHIẾU CHI ---
  const handleDeleteTransaction = async (item) => {
    if (
      !window.confirm(
        `Bạn chắc chắn muốn hủy phiếu chi ${item.code}? \nSố nợ sẽ được tính lại.`,
      )
    )
      return;

    try {
      if (item.type === "PAYMENT") {
        await deleteSupplierPayment(item.id);
        alert("Đã hủy phiếu chi thành công! Công nợ đã được tính lại.");
        fetchDetail(); // Reload lại
      } else {
        alert(
          "Không thể xóa phiếu nhập/trả hàng tại đây. Vui lòng vào Quản lý Nhập kho.",
        );
      }
    } catch (error) {
      alert(
        "Lỗi khi hủy phiếu: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // --- 4. TÍNH TOÁN LỊCH SỬ GIAO DỊCH ĐỂ RENDER ---
  const history = useMemo(() => {
    if (!supplier) return [];

    // Map phiếu nhập/trả hàng
    const tickets = (supplier.tickets || []).map((t) => {
      // Tính tổng tiền phiếu từ details
      const total = t.details.reduce(
        (sum, d) => sum + Number(d.quantity) * Number(d.price),
        0,
      );
      return {
        id: t.id,
        date: t.createdAt,
        type: t.type, // 'IMPORT' hoặc 'RETURN_TO_SUPP'
        code: t.code,
        amount: total,
        creator: t.creator?.fullName || "Hệ thống",
        isTicket: true, // Đánh dấu đây là phiếu kho gốc
      };
    });

    // Map phiếu chi
    const payments = (supplier.payments || []).map((p) => ({
      id: p.id,
      date: p.date,
      type: "PAYMENT", // Tự đánh dấu loại 'PAYMENT'
      code: p.code,
      amount: Number(p.amount),
      creator: p.creator?.fullName || "---",
      note: p.note,
      isTicket: false, // Đây chỉ là phiếu chi
    }));

    // Gộp 2 mảng và sắp xếp theo ngày (mới nhất lên đầu)
    return [...tickets, ...payments].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [supplier]);

  // Hàm render hiển thị công nợ
  const renderDebt = () => {
    const debt = supplier?.debt || 0;
    if (debt > 0) {
      return (
        <span className="text-3xl font-bold text-red-600">
          {debt.toLocaleString()} ₫
        </span>
      );
    } else if (debt < 0) {
      return (
        <div>
          <span className="text-3xl font-bold text-green-600">
            {Math.abs(debt).toLocaleString()} ₫
          </span>
          <div className="text-xs text-green-600 font-medium">
            (Nhà cung cấp nợ mình)
          </div>
        </div>
      );
    }
    return <span className="text-3xl font-bold text-gray-600">0 ₫</span>;
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải chi tiết nhà cung cấp...
      </div>
    );
  if (!supplier)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy dữ liệu nhà cung cấp.
      </div>
    );

  return (
    // !!! ĐẢM BẢO CHỈ CÓ 1 DIV BỌC NGOÀI CÙNG ĐỂ TRÁNH LỖI LẶP UI !!!
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 5. HEADER (Nút Back, Tên NCC, Mã, Nút Tạo Phiếu Chi) */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          title="Quay lại"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{supplier.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{supplier.code}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => {
              // Reset phiếu được chọn về null (nghĩa là tạo phiếu chi mới)
              setSelectedTicketToPay(null);
              // Mở modal
              setIsPayModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all"
          >
            <FaMoneyBill /> Tạo Phiếu Chi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6. CỘT TRÁI: THÔNG TIN TỔNG QUAN (CÔNG NỢ, ĐỊA CHỈ) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">
                Nợ hiện tại
              </p>
              {renderDebt()}
            </div>
            <div className="pt-4 border-t border-gray-100 text-sm space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Nợ đầu kỳ:</span>
                <span className="font-semibold text-gray-700">
                  {Number(supplier.initialDebt).toLocaleString()} ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Số điện thoại:</span>
                <span className="font-medium text-blue-700 flex items-center gap-1.5">
                  <FaPhone className="text-xs" /> {supplier.phone || "---"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Địa chỉ:</span>
                <span
                  className="truncate max-w-[200px] text-gray-700 flex items-center gap-1.5"
                  title={supplier.address}
                >
                  <FaMapMarkerAlt className="text-xs text-red-500" />{" "}
                  {supplier.address || "---"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. CỘT PHẢI: BẢNG LỊCH SỬ GIAO DỊCH */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
            Lịch sử giao dịch (Nhập/Chi/Trả hàng)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Ngày</th>
                  <th className="px-6 py-3.5">Mã phiếu</th>
                  <th className="px-6 py-3.5">Loại phiếu</th>
                  <th className="px-6 py-3.5 text-right">Giá trị</th>
                  <th className="px-6 py-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Chưa có lịch sử giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr
                      key={item.id + item.type}
                      className="hover:bg-gray-50 group transition-colors"
                    >
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(item.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {item.type === "IMPORT" ? (
                          // NẾU LÀ PHIẾU NHẬP -> CHO PHÉP CLICK ĐỂ THANH TOÁN
                          <button
                            onClick={() => {
                              setSelectedTicketToPay(item); // Lưu phiếu vào state
                              setIsPayModalOpen(true); // Mở modal
                            }}
                            className="hover:underline text-blue-600 hover:text-blue-800 transition-all text-left font-bold"
                            title="Click để lập phiếu chi thanh toán cho phiếu nhập này"
                          >
                            {item.code}
                          </button>
                        ) : (
                          // CÁC LOẠI PHIẾU KHÁC (PAYMENT, RETURN)
                          <span className="text-gray-800 font-medium">
                            {item.code}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {item.type === "IMPORT" && (
                          <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded text-xs font-bold tracking-wide">
                            Nhập hàng
                          </span>
                        )}
                        {item.type === "RETURN_TO_SUPP" && (
                          <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded text-xs font-bold tracking-wide">
                            Trả hàng
                          </span>
                        )}
                        {item.type === "PAYMENT" && (
                          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-bold tracking-wide">
                            Thanh toán
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-base">
                        {item.type === "IMPORT" && (
                          <span className="text-orange-600">
                            + {item.amount.toLocaleString()} ₫
                          </span>
                        )}
                        {item.type === "RETURN_TO_SUPP" && (
                          <span className="text-purple-600">
                            - {item.amount.toLocaleString()} ₫
                          </span>
                        )}
                        {item.type === "PAYMENT" && (
                          <span className="text-green-600">
                            - {item.amount.toLocaleString()} ₫
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {item.type === "PAYMENT" && (
                          // NÚT HỦY (XÓA) CHỈ HIỆN VỚI PHIẾU CHI
                          <button
                            onClick={() => handleDeleteTransaction(item)}
                            className="text-gray-300 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Hủy phiếu chi (Dùng để sửa sai)"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 8. PAYMENT MODAL (LẬP PHIẾU CHI) */}
      <PaymentModal
        isOpen={isPayModalOpen} // Quản lý bật/tắt
        onClose={() => {
          // Khi đóng modal, reset luôn dữ liệu phiếu
          setIsPayModalOpen(false);
          setSelectedTicketToPay(null);
        }}
        supplier={supplier} // Thông tin NCC
        selectedTicket={selectedTicketToPay} // Dữ liệu phiếu chi cụ thể (nếu có)
        onSave={handleCreatePayment} // Hàm xử lý lưu
      />
    </div>
  );
};

export default SupplierDetailPage;
