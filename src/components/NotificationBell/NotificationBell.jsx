import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { FaBell } from 'react-icons/fa';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Gọi API lấy dữ liệu (Đã chuẩn hóa cú pháp React Query v5)
const {
    data,
    refetch,
    // Đã xóa mấy cái fetchNextPage ở đây vì không dùng tới nữa
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async () => { // Bỏ luôn pageParam cho nhẹ
      const res = await api.get(`/notifications?limit=10`); // Luôn chỉ lấy đúng 10 cái mới nhất cho cái chuông
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: () => undefined,
    refetchInterval: 5000,
  });

  // 2. CÁC BIẾN BỊ THIẾU Ở LỖI CỦA BẠN ĐÃ ĐƯỢC ĐẶT LẠI VÀO ĐÂY
  const unreadCount = data?.pages[0]?.unreadCount || 0;
  const allNotifications = data?.pages?.flatMap((page) => page.data) || [];

  // 3. HÀM XỬ LÝ SỰ KIỆN BỊ THIẾU
  const handleToggleBell = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      refetch(); // Mở chuông ra là gọi API check xem có tin mới không
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      // Cập nhật lại UI sau khi đọc (Chuẩn v5)
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); 
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  // 4. GIAO DIỆN (UI)
  return (
    <div className="relative">
      {/* Nút Chuông */}
      <button 
        onClick={handleToggleBell} 
        className="relative p-2 text-gray-600 hover:text-blue-600 transition outline-none"
      >
        <FaBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Danh sách */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-800">Thông báo</div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Chưa có thông báo nào.</div>
            ) : (
              allNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                  className={`p-4 border-b cursor-pointer transition ${notif.isRead ? 'bg-white opacity-70' : 'bg-blue-50/50 font-medium'}`}
                >
                  <p className="text-sm text-gray-800 mb-1">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))
            )}
            
            {/* Nút tải thêm */}
            {/* --- NÚT CHUYỂN HƯỚNG SANG TRANG LỚN --- */}
            <div className="border-t p-2 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false); // Đóng cái popover lại cho gọn
                  navigate('/notifications'); // Chuyển thẳng sang trang NotificationPage
                }}
                className="w-full p-2 text-sm text-center text-blue-600 font-bold hover:bg-blue-100 rounded-lg transition-colors"
              >
                Xem tất cả thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;