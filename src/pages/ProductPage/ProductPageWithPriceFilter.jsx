import React from "react";
import ProductPage from "./ProductPage";
import ProductPriceFilterBar from "./components/ProductPriceFilterBar";

const ProductPageWithPriceFilter = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      <ProductPage />
    </div>
  );
};

export default ProductPageWithPriceFilter;