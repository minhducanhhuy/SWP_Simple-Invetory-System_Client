import logo from "./logo.svg";
import "./App.css";
import LoginPage from "./pages/LoginPage/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LocationProvider } from "./context/LocationContext";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import StockTicketListPage from "./pages/StockTicketPage/StockTicketListPage";
import CreateTicketPage from "./pages/StockTicketPage/CreateTicketPage";
import EmployeePage from "./pages/EmployeePage/EmployeePage";
import LocationPage from "./pages/LocationPage/LocationPage";
import CustomerPage from "./pages/CustomerPage/CustomerPage";
import SupplierPage from "./pages/SupplierPage/SupplierPage";
import ProductPage from "./pages/ProductPage/ProductPage";
import MasterDataPage from "./pages/MasterDataPage/MasterDataPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // Hoặc một cái Loading Spinner
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <Routes>
            {/* Route Đăng nhập (Công khai) */}
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/customers" element={<CustomerPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/master-data" element={<MasterDataPage />} />
              <Route path="/stock-tickets" element={<StockTicketListPage />} />
              <Route
                path="/stock-tickets/create"
                element={<CreateTicketPage />}
              />
              <Route path="/employees" element={<EmployeePage />} />
              <Route path="/locations" element={<LocationPage />} />
              <Route path="/suppliers" element={<SupplierPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
