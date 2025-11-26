import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/Adminlayout";
import AuthLayout from "./layouts/AuthLayout";
import StaffLayout from "./layouts/StaffLayout";
import Home from "./pages/User/Home/Home";
import Menu from "./pages/User/Menu/Menu";
import Booking from "./pages/User/Booking/Booking";
import Cart from "./pages/User/Cart/Cart";
import Sign from "./pages/Auth/Sign";
import ResetPassword from "./pages/Auth/reset";
import OrderHistory from "./pages/User/OrderHistory/OrderHistory";
import PaymentSuccess from "./pages/User/PaymentSuccess/PaymentSuccess";
import PaymentFailed from "./pages/User/PaymentFailed/PaymentFailed";
import ProtectRouter from "./pages/protectrouter";
import AdminMenuManagement from "./pages/Admin/AdminMenuManagement";
import AdminAccounts from "./pages/Admin/AdminAccounts";
import AdminTables from "./pages/Admin/AdminTables";
import AdminReports from "./pages/Admin/AdminReports";
import AdminBooking from "./pages/Admin/AdminBooking";
import StaffTables from "./pages/Staff/StaffTables";
import StaffOrders from "./pages/Staff/StaffOrders";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import NotFoundPage from "./pages/404";

function AppRoutes(): React.ReactElement {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Route 404 nằm ngoài cùng để không dính layout */}
        <Route path="/404" element={<NotFoundPage />} />

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/signin"
          element={
            <AuthLayout>
              <Sign />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        {/* Admin Routes Group */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/accounts" replace />}
        />
        <Route
          path="/admin/*"
          element={
            <ProtectRouter
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["admin"]}
            >
              <AdminLayout>
                <Routes>
                  <Route path="accounts" element={<AdminAccounts />} />
                  <Route path="menu" element={<AdminMenuManagement />} />
                  <Route path="tables" element={<AdminTables />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="booking" element={<AdminBooking />} />
                  {/* Catch-all cho admin */}
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectRouter>
          }
        />

        {/* Staff Routes Group */}
        <Route
          path="/staff"
          element={<Navigate to="/staff/tables" replace />}
        />
        <Route
          path="/staff/*"
          element={
            <ProtectRouter
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={["staff", "admin"]}
            >
              <StaffLayout>
                <Routes>
                  <Route path="tables" element={<StaffTables />} />
                  <Route path="orders" element={<StaffOrders />} />
                  {/* Catch-all cho staff */}
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </StaffLayout>
            </ProtectRouter>
          }
        />

        {/* User Routes Group (Main Layout) */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="home" element={<Home />} />
                <Route
                  path="menu"
                  element={
                    <ProtectRouter
                      isAuthenticated={isAuthenticated}
                      userRole={userRole}
                    >
                      <Menu />
                    </ProtectRouter>
                  }
                />
                <Route
                  path="cart"
                  element={
                    <ProtectRouter
                      isAuthenticated={isAuthenticated}
                      userRole={userRole}
                    >
                      <Cart />
                    </ProtectRouter>
                  }
                />
                <Route
                  path="booking"
                  element={
                    <ProtectRouter
                      isAuthenticated={isAuthenticated}
                      userRole={userRole}
                    >
                      <Booking />
                    </ProtectRouter>
                  }
                />
                <Route
                  path="order-history"
                  element={
                    <ProtectRouter
                      isAuthenticated={isAuthenticated}
                      userRole={userRole}
                    >
                      <OrderHistory />
                    </ProtectRouter>
                  }
                />
                <Route path="payment-success" element={<PaymentSuccess />} />
                <Route path="payment-failed" element={<PaymentFailed />} />

                {/* Catch-all cho các link còn lại lọt vào MainLayout */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </MainLayout>
          }
        />

        {/* Fallback cuối cùng */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App(): React.ReactElement {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
