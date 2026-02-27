// src/context/LocationContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { getMyLocations } from "../services/locationService";
import { AuthContext } from "./AuthContext"; // Cần Auth để biết khi nào user login xong

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Lắng nghe user
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Khối: Fetch danh sách kho & Khôi phục kho đã chọn từ localStorage
  useEffect(() => {
    if (!user) {
      setLocations([]);
      setCurrentLocation(null);
      return;
    }

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const data = await getMyLocations();
        setLocations(data);

        // Logic chọn kho mặc định thông minh:
        // 1. Ưu tiên lấy từ localStorage (nếu người dùng đã chọn trước đó)
        const savedLocationId = localStorage.getItem("active_location_id");
        const foundSaved = data.find((loc) => loc.id === savedLocationId);

        if (foundSaved) {
          setCurrentLocation(foundSaved);
        } else if (data.length > 0) {
          // 2. Nếu không có (lần đầu vào), chọn cái đầu tiên
          setCurrentLocation(data[0]);
          localStorage.setItem("active_location_id", data[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách kho:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [user]); // Chạy lại khi user login/logout

  // Khối: Hàm chuyển kho
  const switchLocation = (location) => {
    setCurrentLocation(location);
    localStorage.setItem("active_location_id", location.id);
  };

  return (
    <LocationContext.Provider
      value={{ locations, currentLocation, switchLocation, loading }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Hook custom để dùng cho gọn
export const useLocation = () => useContext(LocationContext);
