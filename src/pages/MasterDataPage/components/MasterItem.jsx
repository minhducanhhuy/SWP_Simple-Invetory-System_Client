import React from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const MasterItem = ({
  item,
  isEditing,
  editName,
  setEditName,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  count, // Số lượng sản phẩm liên quan (nếu có)
}) => (
  <li className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm group hover:border-blue-200 transition-all">
    {isEditing ? (
      <div className="flex gap-2 flex-1 mr-2">
        <input
          className="border p-1.5 rounded w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          autoFocus
        />
        <button
          onClick={() => onSave(item.id)}
          className="text-green-600 hover:bg-green-50 p-1.5 rounded"
        >
          <FaSave />
        </button>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:bg-gray-100 p-1.5 rounded"
        >
          <FaTimes />
        </button>
      </div>
    ) : (
      <>
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">{item.name}</span>
          {count !== undefined && (
            <span className="text-[10px] text-gray-400">
              {count} sản phẩm đang sử dụng
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="text-blue-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
          >
            <FaTrash />
          </button>
        </div>
      </>
    )}
  </li>
);

export default MasterItem;
