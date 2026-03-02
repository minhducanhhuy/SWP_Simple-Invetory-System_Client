import logo from "./logo.svg";
import "./App.css";
import LoginPage from "./pages/LoginPage/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LocationProvider } from "./context/LocationContext";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import StockTicketListPage from "./pages/StockTicketPage/StockTicketListPage";


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
              <Route path="/stock-tickets" element={<StockTicketListPage />} />
            </Route>
          </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
