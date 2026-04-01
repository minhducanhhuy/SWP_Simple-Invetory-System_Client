# Simple Inventory Management (SIM) - Hệ thống Quản lý Kho đơn giản (Frontend)

## Giới thiệu dự án

Đây là phần frontend của hệ thống Simple Inventory Management (SIM), một ứng dụng quản lý kho hàng toàn diện, cung cấp giao diện người dùng trực quan và dễ sử dụng để quản lý các nghiệp vụ kho bãi, sản phẩm, khách hàng, nhà cung cấp, và giao dịch tài chính. Ứng dụng tập trung vào việc tối ưu hóa trải nghiệm người dùng (UX) thông qua thiết kế giao diện (UI) rõ ràng, dễ điều hướng và cung cấp phản hồi tức thì.

## Công nghệ sử dụng

Dự án frontend này được xây dựng trên nền tảng các công nghệ mạnh mẽ và phổ biến, đảm bảo trải nghiệm người dùng mượt mà và hiệu quả:

- **Framework:** [React](https://react.dev/) (phiên bản 19.x) - Thư viện JavaScript hàng đầu để xây dựng giao diện người dùng động và tương tác.
- **Khởi tạo dự án:** [Create React App](https://create-react-app.dev/) (thông qua `react-scripts`) - Cung cấp môi trường phát triển React sẵn sàng, cấu hình đơn giản.
- **Định tuyến:** [React Router DOM](https://reactrouter.com/en/main) (phiên bản 7.x) - Quản lý điều hướng giữa các trang trong ứng dụng Single Page Application (SPA).
- **Quản lý trạng thái & dữ liệu:** [React Query (TanStack Query)](https://tanstack.com/query/latest) - Quản lý việc fetch, cache, đồng bộ và update dữ liệu server-side hiệu quả, cải thiện đáng kể UX.
- **Thiết kế giao diện:** [Tailwind CSS](https://tailwindcss.com/) - Framework CSS tiện ích, giúp xây dựng giao diện tùy chỉnh nhanh chóng, linh hoạt và tối ưu hóa phản hồi.
- **Giao tiếp API:** [Axios](https://axios-http.com/) - Client HTTP dựa trên Promise để tương tác với API backend.
- **Giao tiếp Realtime:** [Socket.IO Client](https://socket.io/docs/v4/client-api/) - Client JavaScript để kết nối với máy chủ Socket.IO, hỗ trợ các tính năng thông báo và cập nhật dữ liệu realtime.
- **Biểu đồ dữ liệu:** [Recharts](https://recharts.org/en-US/) - Thư viện biểu đồ dựa trên React, giúp trực quan hóa dữ liệu một cách sinh động (ví dụ: dashboard thống kê).
- **Xử lý Excel:** [xlsx](https://www.npmjs.com/package/xlsx) và [file-saver](https://www.npmjs.com/package/file-saver) - Cho phép xuất dữ liệu ra file Excel từ giao diện người dùng.
- **Icon:** [React Icons](https://react-icons.github.io/react-icons/) và [Lucide React](https://lucide.dev/for/react) - Cung cấp bộ sưu tập icon đa dạng, giúp tăng tính thẩm mỹ và dễ hiểu cho giao diện.
- **Utilities CSS:** `clsx` và `tailwind-merge` - Hỗ trợ quản lý và kết hợp các class CSS của Tailwind một cách linh hoạt.

## Cấu trúc thư mục chính

Cấu trúc thư mục được tổ chức theo các nguyên tắc của React và tập trung vào khả năng mở rộng, dễ đọc:

```
Simple_Inventory_Management/client/
├── public/                     # Các tài nguyên tĩnh (index.html, manifest.json, robots.txt)
├── src/                        # Mã nguồn chính của ứng dụng
│   ├── assets/                 # Tài nguyên tĩnh như styles, images
│   │   └── styles/
│   │       └── global.css      # Các style CSS global
│   ├── components/             # Các component UI có thể tái sử dụng
│   │   ├── Header/
│   │   ├── NotificationBell/   # Component hiển thị và quản lý thông báo realtime
│   │   ├── pagination/
│   │   ├── PaymentModal/
│   │   └── Sidebar/            # Thanh điều hướng bên trái
│   ├── context/                # Các React Context để quản lý trạng thái global (Auth, Location)
│   │   ├── AuthContext.jsx
│   │   └── LocationContext.jsx
│   ├── layouts/                # Các layout chung cho các trang
│   │   └── MainLayout.jsx
│   ├── lib/                    # Các hàm tiện ích chung
│   │   └── utils.js
│   ├── pages/                  # Các trang (views) chính của ứng dụng
│   │   ├── CashBook/           # Trang quản lý sổ quỹ tiền mặt
│   │   ├── CustomerPage/       # Trang quản lý khách hàng
│   │   ├── DashBoard/          # Trang tổng quan/dashboard với các biểu đồ thống kê
│   │   ├── EmployeePage/       # Trang quản lý nhân viên (với modal mời/chỉnh sửa vai trò)
│   │   ├── InvoicePage/        # Trang quản lý hóa đơn
│   │   ├── LocationPage/       # Trang quản lý địa điểm/kho hàng (với modal tạo/sửa)
│   │   ├── LoginPage/          # Các trang liên quan đến xác thực (Đăng nhập, Quên/Đặt lại mật khẩu, Chấp nhận lời mời)
│   │   ├── MasterDataPage/     # Trang quản lý dữ liệu master (danh mục, đơn vị)
│   │   ├── NotificationPage/   # Trang hiển thị chi tiết các thông báo
│   │   ├── POSPage/            # Trang bán hàng (Point of Sale) với modal in hóa đơn
│   │   ├── ProductPage/        # Trang quản lý sản phẩm (với lọc theo giá, modal sản phẩm, modal thẻ kho)
│   │   ├── ProfilePage/        # Trang thông tin cá nhân
│   │   ├── StockTakePage/      # Trang kiểm kê kho
│   │   ├── StockTicketPage/    # Trang quản lý phiếu nhập/xuất kho (với trang tạo phiếu)
│   │   └── SupplierPage/       # Trang quản lý nhà cung cấp (với trang chi tiết nhà cung cấp)
│   ├── services/               # Các service/API client để gọi backend
│   │   └── ... (nhiều file service khác nhau cho từng module)
│   ├── utils/                  # Các tiện ích khác (ví dụ: validators)
│   ├── App.js                  # Component gốc của ứng dụng React
│   ├── index.js                # Điểm khởi tạo React DOM
│   └── ... (các file cấu hình và test khác)
├── .env                        # Biến môi trường (không được commit vào git)
├── .gitignore                  # Các file/thư mục bị bỏ qua bởi Git
├── package.json                # Thông tin dự án và các dependencies
├── README.md                   # File README của dự án
└── ... (các file cấu hình khác)
```

## Hướng dẫn cài đặt

Để cài đặt và chạy dự án frontend này trên môi trường local của bạn, hãy làm theo các bước sau:

### 1. Yêu cầu hệ thống

Đảm bảo bạn đã cài đặt Node.js (phiên bản 18 trở lên) và npm (hoặc yarn) trên máy tính của mình.

### 2. Thiết lập môi trường local

1.  **Clone repository:**

    ```bash
    git clone <URL_CỦA_REPOSITORY_FRONTEND>
    cd Simple_Inventory_Management/client
    ```

    _(Thay `<URL_CỦA_REPOSITORY_FRONTEND>` bằng URL thực tế của repository frontend của bạn.)_

2.  **Cài đặt các dependencies:**
    Sử dụng npm để cài đặt tất cả các gói cần thiết:

    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường (`.env`)**:
    - Tạo một file có tên `.env` ở thư mục gốc của dự án (`Simple_Inventory_Management/client`).
    - Thêm các biến môi trường sau vào file `.env` của bạn:

      ```dotenv
      REACT_APP_API_BASE_URL=http://localhost:3035/api # URL của API backend
      REACT_APP_WS_URL=ws://localhost:3035             # URL WebSocket cho realtime
      ```

    - **Lưu ý:** `REACT_APP_API_BASE_URL` và `REACT_APP_WS_URL` phải trỏ đến địa chỉ của backend đã được cấu hình và đang chạy.

4.  **Chạy ứng dụng:**
    Khởi động máy chủ phát triển cục bộ:

    ```bash
    npm start
    ```

    Ứng dụng sẽ chạy tại `http://localhost:3000` (hoặc một cổng khác nếu 3000 đã được sử dụng).

5.  **Build cho Production:**
    Để build ứng dụng sẵn sàng cho môi trường production:
    ```bash
    npm run build
    ```
    Các file tĩnh đã được build sẽ nằm trong thư mục `build/`.

## Các tính năng UI/UX chính

Ứng dụng frontend này được thiết kế với trọng tâm vào trải nghiệm người dùng, bao gồm:

- **Giao diện Dashboard trực quan:** Cung cấp tổng quan về tình hình kho hàng và kinh doanh thông qua các biểu đồ (`recharts`) và số liệu thống kê dễ hiểu, giúp người dùng nhanh chóng nắm bắt thông tin quan trọng.
- **Điều hướng dễ dàng:** Sử dụng Sidebar cố định và Header rõ ràng để người dùng có thể truy cập nhanh chóng đến các module chức năng khác nhau của hệ thống.
- **Phản hồi realtime với thông báo:** Tích hợp `Socket.IO` và `NotificationBell` để cung cấp thông báo tức thì về các sự kiện quan trọng (ví dụ: nhập/xuất kho, cập nhật sản phẩm), giúp người dùng luôn được cập nhật.
- **Quản lý dữ liệu hiệu quả:** Các trang quản lý (Sản phẩm, Khách hàng, Nhà cung cấp, v.v.) được thiết kế với bảng dữ liệu có chức năng phân trang, tìm kiếm và lọc, giúp người dùng dễ dàng thao tác với lượng lớn dữ liệu.
- **Form và Modal thân thiện:** Sử dụng các modal (`PaymentModal`, `ProductModal`, `LocationModal`, `EditRoleModal`, `InviteUserModal`, `ReceiptModal`, `StockCardModal`) cho các tác vụ tạo/chỉnh sửa, giúp tập trung sự chú ý của người dùng và giảm thiểu lỗi nhập liệu. Các form có validation rõ ràng để hướng dẫn người dùng nhập liệu đúng cách.
- **Chức năng POS (Point of Sale) tiện lợi:** Trang POS được tối ưu hóa cho nghiệp vụ bán hàng nhanh chóng, bao gồm việc thêm sản phẩm vào giỏ hàng, tính toán tổng tiền và tạo hóa đơn in ấn dễ dàng.
- **Trực quan hóa dữ liệu sản phẩm:** Trang sản phẩm có tính năng lọc theo giá (`ProductPriceFilterBar`) và hiển thị thông tin thẻ kho (`StockCardModal`), giúp người dùng có cái nhìn sâu sắc hơn về tình trạng sản phẩm.
- **Hỗ trợ đa vai trò:** Giao diện được thiết kế để hỗ trợ các vai trò người dùng khác nhau (OWNER, ADMIN_SYSTEM, MANAGER, WAREHOUSE_STAFF, SALESPERSON, STAFF) với quyền truy cập và chức năng tương ứng.
- **Xuất dữ liệu Excel:** Cho phép người dùng dễ dàng xuất các báo cáo hoặc danh sách dữ liệu ra file Excel từ giao diện, hỗ trợ các tác vụ phân tích offline.
- **Thiết kế phản hồi (Responsive Design):** Đảm bảo giao diện hoạt động tốt trên nhiều kích thước màn hình và thiết bị (mặc dù cần kiểm tra kỹ lưỡng).
