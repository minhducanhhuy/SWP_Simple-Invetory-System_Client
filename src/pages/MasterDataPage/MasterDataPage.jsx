import React, { useState, useEffect } from "react";

import { getCategories, getUnits } from "../../services/masterDataService";
import CategoryManager from "./components/CategoryManager";
import UnitManager from "./components/UnitManager";

const MasterDataPage = () => {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const fetchData = async () => {
    try {
      const [catData, unitData] = await Promise.all([
        getCategories(),
        getUnits(),
      ]);
      setCategories(catData);
      setUnits(unitData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu Master Data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <CategoryManager categories={categories} refresh={fetchData} />
      <UnitManager units={units} refresh={fetchData} />
    </div>
  );
};

export default MasterDataPage;
