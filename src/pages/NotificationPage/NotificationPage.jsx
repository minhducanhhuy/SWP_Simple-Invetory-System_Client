import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { FaRegBell, FaCheck, FaEye } from 'react-icons/fa';

const NotificationPage = () => {
  const queryClient = useQueryClient();

  // Gọi API lấy dữ liệu (Giữ nguyên logic chuẩn React Query v5)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['notifications-page'],
    queryFn: async ({ pageParam }) => {
      const cursorParam = pageParam ? `&cursor=${pageParam}` : '';
      const res = await api.get(`/notifications?limit=20${cursorParam}`);
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });

  const allNotifications = data?.pages?.flatMap((page) => page.data) || [];

  // Hàm đánh dấu đã đọc
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Update cả chuông ở Header
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  // Hàm render Badge phân loại cho giống cái badge "Nhập hàng" màu xanh lá
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">Thêm mới</span>;
      case 'WARNING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">Cảnh báo</span>;
      case 'ERROR':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">Lỗi</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">Thay đổi</span>;
    }
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans"> {/* Màu nền xám nhạt giống ảnh */}
      
      {/* HEADER CỦA PAGE */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex items-start gap-3">
          <FaRegBell className="text-blue-600 text-2xl mt-1" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tất cả thông báo</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý lịch sử thông báo hệ thống và nghiệp vụ</p>
          </div>
        </div>
        
        {/* Nút hành động góc phải (Giống nút + Tạo phiếu mới) */}
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          onClick={() => alert('Tính năng đánh dấu đọc tất cả sẽ cập nhật sau!')}
        >
          <FaCheck /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* CARD BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Tiêu đề cột */}
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-16 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-1/4">Tiêu đề</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-32">Phân loại</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nội dung</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-40">Thời gian</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            
            {/* Nội dung bảng */}
            <tbody className="divide-y divide-gray-100">
              {allNotifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                    Chưa có thông báo nào.
                  </td>
                </tr>
              ) : (
                allNotifications.map((notif) => (
                  <tr 
                    key={notif.id} 
                    className={`hover:bg-gray-50 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/20'}`}
                  >
                    {/* Trạng thái (Dấu chấm xanh nếu chưa đọc) */}
                    <td className="px-6 py-4 text-center">
                      {!notif.isRead && (
                        <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></span>
                      )}
                    </td>

                    {/* Tiêu đề */}
                    <td className="px-6 py-4">
                      <span className={`text-sm ${notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-900 font-bold'}`}>
                        {notif.title}
                      </span>
                    </td>

                    {/* Phân loại (Badge) */}
                    <td className="px-6 py-4">
                      {renderTypeBadge(notif.type)}
                    </td>

                    {/* Nội dung */}
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" title={notif.message}>
                      {notif.message}
                    </td>

                    {/* Thời gian */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(notif.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit', minute: '2-digit',
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </td>

                    {/* Thao tác (Icon con mắt) */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                        className={`p-2 rounded-full transition-colors ${notif.isRead ? 'text-gray-400 cursor-default' : 'text-blue-500 hover:bg-blue-100 cursor-pointer'}`}
                        title={notif.isRead ? "Đã đọc" : "Đánh dấu đã đọc"}
                      >
                        <FaEye className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer chứa nút Tải thêm */}
        {hasNextPage && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isFetchingNextPage ? 'Đang tải...' : 'Hiển thị thêm thông báo ↓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;