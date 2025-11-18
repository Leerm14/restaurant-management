import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import AdminLayout from "./layouts/Adminlayout.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import Home from "./pages/User/Home/Home.tsx";
import Menu from "./pages/User/Menu/Menu.tsx";
import Booking from "./pages/User/Booking/Booking.tsx";
import Sign from "./pages/Auth/Sign.tsx";
import OrderHistory from "./pages/User/OrderHistory/OrderHistory.tsx";
import ProtectRouter from "./pages/protectrouter.tsx";
import AdminMenuManagement from "./pages/Admin/AdminMenuManagement.tsx";
import AdminAccounts from "./pages/Admin/AdminAccounts.tsx";
import AdminTables from "./pages/Admin/AdminTables.tsx";
import AdminReports from "./pages/Admin/AdminReports.tsx";
import AdminSettings from "./pages/Admin/AdminSettings.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";

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
                  <Route path="/accounts" element={<AdminAccounts />} />
                  <Route path="/menu" element={<AdminMenuManagement />} />
                  <Route path="/tables" element={<AdminTables />} />
                  <Route path="/reports" element={<AdminReports />} />
                  <Route path="/settings" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            </ProtectRouter>
          }
        />

        {/* Main Routes */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route
                  path="/menu"
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
                  path="/booking"
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
                  path="/order-history"
                  element={
                    <ProtectRouter
                      isAuthenticated={isAuthenticated}
                      userRole={userRole}
                    >
                      <OrderHistory />
                    </ProtectRouter>
                  }
                />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App(): React.ReactElement {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
