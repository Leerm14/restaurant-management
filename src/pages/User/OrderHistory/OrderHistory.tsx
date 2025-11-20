import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../services/api";
import "./OrderHistory.css";

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  userFullName: string;
  tableId: number;
  tableName: string;
  orderType: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

const OrderHistory: React.FC = () => {
  const { userId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/api/orders/user/${userId}`);
        const ordersData = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];
        console.log("Fetched orders:", ordersData);

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Đang xử lý",
      Confirmed: "Đã xác nhận",
      Preparing: "Đang chuẩn bị",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Pending":
      case "Confirmed":
      case "Preparing":
        return "status-processing";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleViewDetails = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      console.log("Fetched order details:", response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="order-history-page">
      <div className="container">
        <div className="order-history-header">
          <h1 className="page-title">Lịch sử đơn hàng của bạn</h1>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Ngày đặt</th>
                  <th>Loại đơn</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{orders.indexOf(order) + 1}</td>
                    <td className="order-date">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="order-type">
                      {order.orderType === "Dinein" ? "Tại chỗ" : "Mang về"}
                    </td>
                    <td className="order-total">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td>
                      <span
                        className={`status-badge-order-history ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-button"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>Loại đơn:</strong>{" "}
                  {selectedOrder.orderType === "Dinein" ? "Tại chỗ" : "Mang về"}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    className={`status-badge-order-history ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                </p>
              </div>
              <div className="order-items">
                <h3>Món đã đặt:</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Món</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.menuItemName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.priceAtOrder)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="order-total-detail">
                <strong>Tổng cộng:</strong>
                <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
