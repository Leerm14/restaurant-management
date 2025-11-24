import React, { useState, useEffect } from "react";
import "./StaffTables.css";
import apiClient from "../../services/api";

interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
}

const StaffTables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTables, setRefreshTables] = useState(0);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/tables");
        setTables(response.data);
      } catch (error) {
        console.error("Error fetching tables:", error);
        alert("Có lỗi khi tải danh sách bàn!");
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [refreshTables]);

  const handleUpdateStatus = async (tableId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/tables/${tableId}/status`, null, {
        params: { status: newStatus },
      });
      alert("Cập nhật trạng thái bàn thành công!");
      setRefreshTables((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating table status:", error);
      alert("Có lỗi khi cập nhật trạng thái bàn!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "#27ae60";
      case "Occupied":
        return "#e74c3c";
      case "Reserved":
        return "#3498db";
      case "Cleaning":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Available":
        return "Trống";
      case "Occupied":
        return "Có khách";
      case "Reserved":
        return "Đã đặt";
      case "Cleaning":
        return "Đang dọn";
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: "Available", label: "Trống" },
    { value: "Occupied", label: "Có khách" },
    { value: "Reserved", label: "Đã đặt" },
    { value: "Cleaning", label: "Đang dọn" },
  ];

  if (loading) {
    return (
      <div className="staff-tables">
        <div className="staff-tables-loading-state">
          <i className="fas fa-spinner fa-spin"></i> Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="staff-tables">
      <div className="staff-content-card">
        <div className="tables-header">
          <h1>
            <i className="fas fa-chair"></i> Quản Lý Bàn
          </h1>
          <button
            className="btn-refresh"
            onClick={() => setRefreshTables((prev) => prev + 1)}
          >
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>

        <div className="tables-stats">
          <div className="stat-card available">
            <i className="fas fa-check-circle"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Available").length}
              </span>
              <span className="stat-label">Bàn trống</span>
            </div>
          </div>
          <div className="stat-card occupied">
            <i className="fas fa-users"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Occupied").length}
              </span>
              <span className="stat-label">Có khách</span>
            </div>
          </div>
          <div className="stat-card reserved">
            <i className="fas fa-bookmark"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Reserved").length}
              </span>
              <span className="stat-label">Đã đặt</span>
            </div>
          </div>
          <div className="stat-card cleaning">
            <i className="fas fa-broom"></i>
            <div className="stat-info">
              <span className="stat-number">
                {tables.filter((t) => t.status === "Cleaning").length}
              </span>
              <span className="stat-label">Đang dọn</span>
            </div>
          </div>
        </div>

        <div className="tables-grid">
          {tables.map((table) => (
            <div key={table.id} className="table-card">
              <div
                className="table-number"
                style={{ backgroundColor: getStatusColor(table.status) }}
              >
                <i className="fas fa-utensils"></i>
                <span>Bàn {table.tableNumber}</span>
              </div>
              <div className="table-info">
                <div className="table-capacity">
                  <i className="fas fa-user-friends"></i>
                  <span>{table.capacity} người</span>
                </div>
                <div
                  className="table-status"
                  style={{ color: getStatusColor(table.status) }}
                >
                  <i className="fas fa-circle"></i>
                  <span>{getStatusLabel(table.status)}</span>
                </div>
              </div>
              <div className="table-actions">
                <label>Cập nhật trạng thái:</label>
                <select
                  value={table.status}
                  onChange={(e) => handleUpdateStatus(table.id, e.target.value)}
                  className="staff-tables-status-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffTables;
