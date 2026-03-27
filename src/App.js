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
import StockTakePage from "./pages/StockTakePage/StockTakePage";
import ProductPageWithPriceFilter from "./pages/ProductPage/ProductPageWithPriceFilter";
import SupplierDetailPage from "./pages/SupplierDetailPage/SupplierDetailPage";
import ResetPasswordPage from "./pages/LoginPage/ResetPasswordPage";
import ForgotPasswordPage from "./pages/LoginPage/ForgotPasswordPage";
import AcceptInvitePage from "./pages/LoginPage/AcceptInvitePage";
import POSPage from "./pages/POSPage/POSpage";
import CashbookPage from "./pages/CashBook/CashBookPage";
import NotificationPage from "./pages/NotificationPage/NotificationPage";
import InvoiceListPage from "./pages/InvoicePage/InvoicePage";
import DashboardPage from "./pages/DashBoard/DashBoardPage";

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
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/accept-invite" element={<AcceptInvitePage />} />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/cashbook" element={<CashbookPage />} />
            <Route path="/invoices" element={<InvoiceListPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* THAY VÌ ĐỂ TRỐNG, CHÚNG TA ĐẶT INDEX ROUTE LÀ DASHBOARD */}
              <Route index element={<DashboardPage />} />
              <Route
                path="/products"
                element={<ProductPageWithPriceFilter />}
              />
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
              <Route path="/stock-take" element={<StockTakePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
            </Route>
          </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
