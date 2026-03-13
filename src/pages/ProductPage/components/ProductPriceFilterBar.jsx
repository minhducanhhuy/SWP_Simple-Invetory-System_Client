import React from "react";
import { useSearchParams } from "react-router-dom";

const ProductPriceFilterBar = () => {
  const [params, setParams] = useSearchParams();

  const handlePriceChange = (value) => {
    if (value === "lt5000") {
      params.set("minPrice", "");
      params.set("maxPrice", "5000");
    } else if (value === "5000to10000") {
      params.set("minPrice", "5000");
      params.set("maxPrice", "10000");
    } else if (value === "gt10000") {
      params.set("minPrice", "10000");
      params.set("maxPrice", "");
    } else {
      params.delete("minPrice");
      params.delete("maxPrice");
    }
    setParams(params);
  };

  const handleSortChange = (value) => {
    if (value) {
      params.set("sortPrice", value);
    } else {
      params.delete("sortPrice");
    }
    setParams(params);
  };

  return (
    <div className="flex items-center gap-3">
      <select
        onChange={(e) => handlePriceChange(e.target.value)}
        className="border px-3 py-2 rounded-lg"
      >
        <option value="">Tất cả giá</option>
        <option value="lt5000">Dưới 5000</option>
        <option value="5000to10000">5000 - 10000</option>
        <option value="gt10000">Trên 10000</option>
      </select>

      <select
        onChange={(e) => handleSortChange(e.target.value)}
        className="border px-3 py-2 rounded-lg"
      >
        <option value="">Sắp xếp mặc định</option>
        <option value="asc">Giá tăng dần</option>
        <option value="desc">Giá giảm dần</option>
      </select>
    </div>
  );
};

export default ProductPriceFilterBar;