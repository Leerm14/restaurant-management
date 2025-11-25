import React, { useState, useEffect } from "react";
import "./StaffOrders.css";
import apiClient from "../../services/api";

interface Order {
  id: number;
  userId: number;
  userFullName: string;
  tableId: number | null;
  tableName: string | null;
  totalAmount: number;
  status: "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";
  orderType: "Dinein" | "Takeaway" | "Delivery";
  createdAt: string;
  orderItems: OrderItem[];
  bookingTime?: string | null;
}

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

const StaffOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending");
  const [searchType, setSearchType] = useState<"email" | "phone" | "table">(
    "email"
  );
  const [searchValue, setSearchValue] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const statusOptions = [
    { value: "Pending", label: "Chờ xử lý", color: "#f39c12" },
    { value: "Preparing", label: "Đang chuẩn bị", color: "#3498db" },
    { value: "Ready", label: "Sẵn sàng", color: "#9b59b6" },
    { value: "Completed", label: "Hoàn thành", color: "#27ae60" },
    { value: "Cancelled", label: "Đã hủy", color: "#e74c3c" },
  ];

  const fetchOrdersByStatus = async (status: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/orders/status/${status}`);
      setOrders(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Có lỗi khi tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByStatus(selectedStatus);
  }, [selectedStatus]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert("Vui lòng nhập thông tin tìm kiếm!");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (searchType === "email") {
        response = await apiClient.get("/api/orders/search/email", {
          params: { email: searchValue },
        });
      } else if (searchType === "phone") {
        response = await apiClient.get("/api/orders/search/phone", {
          params: { phone: searchValue },
        });
      } else if (searchType === "table") {
        response = await apiClient.get(`/api/orders/table/${searchValue}`);
      }

      setOrders(response?.data || []);
    } catch (error) {
      console.error("Error searching orders:", error);
      alert("Không tìm thấy đơn hàng!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      });
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      alert("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrdersByStatus(selectedStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Có lỗi khi cập nhật trạng thái!");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await apiClient.patch(`/api/orders/${orderId}/cancel`);
        alert("Đã hủy đơn hàng thành công!");
        fetchOrdersByStatus(selectedStatus);
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Có lỗi khi hủy đơn hàng!");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption?.color || "#95a5a6";
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption?.label || status;
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "Dinein":
        return "Tại chỗ";
      case "Takeaway":
        return "Mang đi";
      default:
        return type;
    }
  };

  return (
    <div className="staff-orders">
      <div className="staff-orders-content-card">
        <div className="staff-orders-header">
          <h1>
            <i className="fas fa-receipt"></i> Quản Lý Đơn Hàng
          </h1>
        </div>

        <div className="staff-orders-controls">
          <div className="staff-status-filters">
            <label>Lọc theo trạng thái:</label>
            <div className="staff-status-buttons">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  className={`staff-status-btn ${
                    selectedStatus === status.value ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedStatus === status.value
                        ? status.color
                        : "transparent",
                    borderColor: status.color,
                    color:
                      selectedStatus === status.value ? "white" : status.color,
                  }}
                  onClick={() => setSelectedStatus(status.value)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="staff-search-section">
            <label>Tìm kiếm đơn hàng:</label>
            <div className="staff-search-controls">
              <select
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "email" | "phone" | "table")
                }
                className="staff-search-type-select"
              >
                <option value="email">Email</option>
                <option value="phone">Số điện thoại</option>
                <option value="table">Số bàn</option>
              </select>
              <input
                type="text"
                placeholder={
                  searchType === "email"
                    ? "Nhập email..."
                    : searchType === "phone"
                    ? "Nhập số điện thoại..."
                    : "Nhập số bàn..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="staff-search-input"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="staff-btn-search" onClick={handleSearch}>
                <i className="fas fa-search"></i> Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="staff-loading-state">
            <i className="fas fa-spinner fa-spin"></i> Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className="staff-empty-state">
            <i className="fas fa-inbox"></i>
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="staff-orders-list">
            {orders.map((order) => (
              <div key={order.id} className="staff-order-card">
                <div className="staff-order-header-card">
                  <div className="staff-order-info-main">
                    <h3>
                      <i className="fas fa-hashtag"></i> Đơn hàng #{order.id}
                    </h3>
                    <div className="staff-order-meta">
                      <span className="staff-order-type">
                        <i className="fas fa-concierge-bell"></i>
                        {getOrderTypeLabel(order.orderType)}
                      </span>
                      {order.tableName && (
                        <span className="staff-table-info">
                          <i className="fas fa-chair"></i> {order.tableName}
                        </span>
                      )}
                      <span className="staff-order-date">
                        {getOrderTypeLabel(order.orderType) === "Tại chỗ" ? (
                          <div>
                            <i className="fas fa-clock"></i>{" "}
                            {formatDate(order.createdAt)}
                          </div>
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div
                    className="staff-order-status-badge"
                    style={{
                      backgroundColor: getStatusColor(order.status),
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="staff-order-customer">
                  <div className="staff-customer-info">
                    <i className="fas fa-user"></i>
                    <span>{order.userFullName}</span>
                  </div>
                </div>

                <div className="staff-order-items-section">
                  <button
                    className="staff-toggle-items-btn"
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                  >
                    <i
                      className={`fas fa-chevron-${
                        expandedOrder === order.id ? "up" : "down"
                      }`}
                    ></i>
                    {expandedOrder === order.id
                      ? "Ẩn chi tiết"
                      : "Xem chi tiết"}{" "}
                    (món)
                  </button>

                  {expandedOrder === order.id && (
                    <div className="staff-order-items-list">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="staff-order-item">
                          <span className="staff-item-name">
                            {item.quantity}x {item.menuItemName}
                          </span>
                          <span className="staff-item-price">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      ))}
                      <div className="staff-order-total">
                        <span>Tổng cộng:</span>
                        <span className="staff-total-amount">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="staff-order-actions">
                  <div className="staff-status-update">
                    <label>Cập nhật trạng thái:</label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateStatus(order.id, e.target.value)
                      }
                      className="staff-status-select"
                      disabled={order.status === "Cancelled"}
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {order.status !== "Cancelled" &&
                    order.status !== "Completed" && (
                      <button
                        className="staff-btn-cancel-order"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <i className="fas fa-times-circle"></i> Hủy đơn hàng
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffOrders;
