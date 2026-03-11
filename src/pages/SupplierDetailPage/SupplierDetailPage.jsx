import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPhone,
  FaMapMarkerAlt,
  FaFileInvoice,
  FaMoneyBill,
  FaTrash, // <--- 1. THÊM IMPORT NÀY
} from "react-icons/fa";
// Import service tương ứng của bạn
import {
  createSupplierPayment,
  deleteSupplierPayment,
} from "../../services/supplierPaymentService";
import api from "../../services/api";
import PaymentModal from "../../components/PaymentModal/PaymentModal";

const SupplierDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Load chi tiết
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/suppliers/${id}`);
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

  const handleCreatePayment = async (paymentData) => {
    try {
      await createSupplierPayment(paymentData);
      alert("Thanh toán thành công!");
      setIsPayModalOpen(false);
      fetchDetail(); // Reload để tính lại nợ
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi thanh toán");
    }
  };

  // Hàm xử lý xóa giao dịch (để sửa sai)
  const handleDeleteTransaction = async (item) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa phiếu ${item.code}?`)) return;

    try {
      if (item.type === "PAYMENT") {
        await deleteSupplierPayment(item.id);
        alert("Đã hủy phiếu chi thành công! Công nợ đã được tính lại.");
        fetchDetail(); // Reload lại để cập nhật số nợ mới
      } else {
        alert(
          "Hiện tại chưa hỗ trợ xóa phiếu nhập kho từ màn hình này. Vui lòng vào Quản lý Nhập/Xuất.",
        );
      }
    } catch (error) {
      alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
    }
  };

  // Tính toán hiển thị danh sách lịch sử
  const history = useMemo(() => {
    if (!supplier) return [];

    // Mapping Phiếu kho
    const tickets = (supplier.tickets || []).map((t) => {
      const total = t.details.reduce(
        (sum, d) => sum + Number(d.quantity) * Number(d.price),
        0,
      );
      return {
        id: t.id,
        date: t.createdAt,
        type: t.type, // IMPORT | RETURN_TO_SUPP
        code: t.code,
        amount: total,
        creator: t.creator?.fullName,
        isTicket: true,
      };
    });

    // Mapping Phiếu chi
    const payments = (supplier.payments || []).map((p) => ({
      id: p.id,
      date: p.date,
      type: "PAYMENT",
      code: p.code,
      amount: Number(p.amount),
      creator: p.creator?.fullName,
      note: p.note,
      isTicket: false,
    }));

    return [...tickets, ...payments].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [supplier]);

  // Render số nợ có màu sắc
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

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!supplier) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border rounded-full hover:bg-gray-100"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{supplier.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{supplier.code}</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm"
          >
            <FaMoneyBill /> Tạo Phiếu Chi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info & Debt */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                Nợ hiện tại
              </p>
              {renderDebt()}
            </div>
            <div className="pt-4 border-t text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Nợ đầu kỳ:</span>
                <span className="font-medium">
                  {Number(supplier.initialDebt).toLocaleString()} ₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SĐT:</span>
                <span>{supplier.phone || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Địa chỉ:</span>
                <span className="truncate max-w-[150px]">
                  {supplier.address || "---"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 font-bold text-gray-700">
            Lịch sử giao dịch
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 font-semibold border-b">
                <tr>
                  <th className="px-6 py-3">Ngày</th>
                  <th className="px-6 py-3">Mã phiếu</th>
                  <th className="px-6 py-3">Loại</th>
                  <th className="px-6 py-3 text-right">Giá trị</th>
                  {/* 2. THÊM CỘT THAO TÁC */}
                  <th className="px-6 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((item) => (
                  <tr
                    key={item.id + item.type}
                    className="hover:bg-gray-50 group"
                  >
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(item.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-3 font-medium text-blue-600">
                      {item.code}
                    </td>
                    <td className="px-6 py-3">
                      {item.type === "IMPORT" && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                          Nhập hàng
                        </span>
                      )}
                      {item.type === "RETURN_TO_SUPP" && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                          Trả hàng
                        </span>
                      )}
                      {item.type === "PAYMENT" && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                          Thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                      {item.type === "IMPORT" && (
                        <span className="text-orange-600">
                          + {item.amount.toLocaleString()}
                        </span>
                      )}
                      {item.type === "RETURN_TO_SUPP" && (
                        <span className="text-purple-600">
                          - {item.amount.toLocaleString()}
                        </span>
                      )}
                      {item.type === "PAYMENT" && (
                        <span className="text-green-600">
                          - {item.amount.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* 3. THÊM NÚT XÓA */}
                    <td className="px-6 py-3 text-center">
                      {item.type === "PAYMENT" && (
                        <button
                          onClick={() => handleDeleteTransaction(item)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Hủy phiếu chi (Sửa sai)"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        supplier={supplier}
        onSave={handleCreatePayment}
      />
    </div>
  );
};

export default SupplierDetailPage;
