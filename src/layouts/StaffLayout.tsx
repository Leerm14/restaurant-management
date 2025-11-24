import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./StaffLayout.css";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.svg";

interface StaffLayoutProps {
  children?: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h2>Nhân Viên</h2>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/staff/tables"
            className={`nav-item ${
              location.pathname === "/staff/tables" ? "active" : ""
            }`}
          >
            <i className="fas fa-chair"></i>
            <span>Quản Lý Bàn</span>
          </Link>
          <Link
            to="/staff/orders"
            className={`nav-item ${
              location.pathname === "/staff/orders" ? "active" : ""
            }`}
          >
            <i className="fas fa-receipt"></i>
            <span>Quản Lý Đơn Hàng</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="staff-main">
        <header className="staff-header">
          <div className="staff-header-content">
            <h1>Hệ Thống Quản Lý Nhân Viên</h1>
            <div className="header-user">
              <i className="fas fa-user-circle"></i>
              <span>Nhân viên</span>
            </div>
          </div>
        </header>

        <div className="staff-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
