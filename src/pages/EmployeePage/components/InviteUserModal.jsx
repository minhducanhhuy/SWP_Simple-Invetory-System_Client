import React, { useState } from "react";
import { FaEnvelope, FaSpinner } from "react-icons/fa";

const InviteUserModal = ({ isOpen, onClose, onInvite, roles }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("WAREHOUSE_STAFF");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onInvite({ email, role });
    setSubmitting(false);
    // Reset form sau khi gửi
    setEmail("");
    setRole("WAREHOUSE_STAFF");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Mời nhân viên mới</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email nhận lời mời
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                type="email"
                className="w-full border border-gray-300 rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hệ thống sẽ gửi email chứa liên kết kích hoạt.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phân quyền
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`cursor-pointer border rounded-lg p-2 text-center text-xs font-medium transition-all ${
                    role === r.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg flex items-center gap-2"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              {submitting ? "Đang gửi..." : "Gửi lời mời"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
