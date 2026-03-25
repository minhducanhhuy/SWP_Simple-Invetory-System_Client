import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "../../lib/utils"; // Import hàm gộp class ở Bước 1

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      // Các class định dạng nút bấm chuẩn Shadcn
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
      // Hiệu ứng di chuột
      "hover:bg-gray-100 hover:text-gray-900",
      // Hiệu ứng khi đang ở trang hiện tại (Active)
      isActive &&
        "border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900",
      // Kích thước nút
      size === "default" ? "h-9 px-4 py-2" : "",
      size === "icon" ? "h-9 w-9" : "",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4 text-gray-500" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
};
