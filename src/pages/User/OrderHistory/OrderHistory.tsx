import React, { useState } from "react";
import "./OrderHistory.css";

interface Order {
  id: string;
  date: string;
  total: string;
  status: "Hoàn thành" | "Đang xử lý" | "Đã hủy";
  action: string;
}

const OrderHistory: React.FC = () => {
  const [orders] = useState<Order[]>([
    {
      id: "ORD001",
      date: "2024-07-20",
      total: "₫350,000",
      status: "Hoàn thành",
      action: "Chi tiết",
    },
    {
      id: "ORD002",
      date: "2024-07-19",
      total: "₫280,000",
      status: "Đang xử lý",
      action: "Chi tiết",
    },
    {
      id: "ORD003",
      date: "2024-07-18",
      total: "₫420,000",
      status: "Đã hủy",
      action: "Chi tiết",
    },
    {
      id: "ORD004",
      date: "2024-07-17",
      total: "₫180,000",
      status: "Hoàn thành",
      action: "Chi tiết",
    },
    {
      id: "ORD005",
      date: "2024-07-16",
      total: "₫410,000",
      status: "Đang xử lý",
      action: "Chi tiết",
    },
    {
      id: "ORD006",
      date: "2024-07-15",
      total: "₫320,000",
      status: "Hoàn thành",
      action: "Chi tiết",
    },
  ]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "status-completed";
      case "Đang xử lý":
        return "status-processing";
      case "Đã hủy":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleViewDetails = (orderId: string) => {
    console.log("View details for order:", orderId);
    // Navigate to order details page
  };

  return (
    <div className="order-history-page">
      <div className="container">
        <div className="order-history-header">
          <h1 className="page-title">Lịch sử đơn hàng của bạn</h1>
        </div>

        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td className="order-date">{order.date}</td>
                  <td className="order-total">{order.total}</td>
                  <td>
                    <span
                      className={`status-badge-order-history ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      {order.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="empty-state">
            <p>Bạn chưa có đơn hàng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
