import React from "react";

const StatCard = ({ title, value, icon, color, sub }) => (
  <div className="flex transform items-start justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
    <div>
      <p className="mb-1 text-sm font-medium text-gray-500">{title}</p>
      <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
      {sub && <p className="mt-2 text-xs text-gray-400">{sub}</p>}
    </div>
    <div
      className={`rounded-lg p-3 shadow-md ${color} flex items-center justify-center`}
    >
      {icon}
    </div>
  </div>
);

export default StatCard;
