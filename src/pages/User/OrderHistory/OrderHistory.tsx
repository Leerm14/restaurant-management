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
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

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

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      // Lấy thông tin order để biết tableId
      const orderResponse = await apiClient.get(`/api/orders/${orderId}`);
      const orderData = orderResponse.data;
      console.log("Order data for cancellation:", orderData);

      // Hủy order
      await apiClient.patch(`/api/orders/${orderId}/cancel`);

      // Nếu order có tableId và là Dinein, xóa booking của bàn đó
      if (orderData.tableId && orderData.orderType === "Dinein") {
        try {
          // Lấy danh sách bookings của user
          const bookingsResponse = await apiClient.get(
            `/api/bookings/user/${userId}`
          );
          const bookings = bookingsResponse.data;
          console.log("User bookings for cancellation:", bookings);
          // Tìm booking của bàn này
          const tableBooking = bookings.find(
            (booking: any) =>
              booking.table?.id === orderData.tableId &&
              (booking.status === "Confirmed" || booking.status === "Pending")
          );

          // Nếu tìm thấy booking, xóa nó
          if (tableBooking) {
            await apiClient.delete(`/api/bookings/${tableBooking.id}`);
            console.log(
              `Đã xóa booking ${tableBooking.id} cho bàn ${orderData.tableId}`
            );
          }
        } catch (bookingError) {
          console.error("Error deleting booking:", bookingError);
          // Không hiển thị lỗi cho user vì order đã được hủy thành công
        }
      }

      alert("Đã hủy đơn hàng thành công!");

      // Refresh orders list
      const response = await apiClient.get(`/api/orders/user/${userId}`);
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      setOrders(ordersData);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      if (error.response?.status === 400) {
        alert(
          "Không thể hủy đơn hàng này. Chỉ có thể hủy đơn hàng đang chờ xử lý."
        );
      } else {
        alert("Không thể hủy đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder({ ...order });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (!editingOrder) return;

    const updatedItems = editingOrder.orderItems.map((item) => {
      if (item.id === itemId) {
        const newSubtotal = item.priceAtOrder * newQuantity;
        return { ...item, quantity: newQuantity, subtotal: newSubtotal };
      }
      return item;
    });

    const newTotalAmount = updatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    setEditingOrder({
      ...editingOrder,
      orderItems: updatedItems,
      totalAmount: newTotalAmount,
    });
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;

    setUpdatingOrderId(editingOrder.id);
    try {
      const orderCreateRequest: any = {
        userId: editingOrder.userId,
        orderType: editingOrder.orderType,
        orderItems: editingOrder.orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      };

      // Thêm tableId cho Dinein (nếu có)
      if (editingOrder.orderType === "Dinein") {
        if (editingOrder.tableId) {
          orderCreateRequest.tableId = editingOrder.tableId;
        }
      }
      // Takeaway không gửi tableId

      await apiClient.put(`/api/orders/${editingOrder.id}`, orderCreateRequest);
      alert("Cập nhật đơn hàng thành công!");

      // Refresh orders list
      const response = await apiClient.get(`/api/orders/user/${userId}`);
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      setOrders(ordersData);
      setEditingOrder(null);
    } catch (error: any) {
      console.error("Error updating order:", error);
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || error.response?.data || "";
        alert(`Không thể cập nhật đơn hàng: ${errorMessage}`);
      } else {
        alert("Không thể cập nhật đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        <div className="order-history-header">
          <h1 className="page-title">Lịch sử đơn hàng của bạn</h1>
        </div>

        {loading ? (
          <div className="order-history-loading-state">
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="order-history-empty-state">
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
                      <div className="action-buttons-group">
                        <button
                          className="action-button view-btn"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          Chi tiết
                        </button>
                        {order.status === "Pending" && (
                          <>
                            <button
                              className="action-button edit-btn"
                              onClick={() => handleEditOrder(order)}
                              disabled={updatingOrderId === order.id}
                            >
                              Sửa
                            </button>
                            <button
                              className="action-button cancel-btn"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={updatingOrderId === order.id}
                            >
                              {updatingOrderId === order.id
                                ? "Đang xử lý..."
                                : "Hủy"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingOrder && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa đơn hàng #{editingOrder.id}</h2>
              <button className="close-button" onClick={handleCancelEdit}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(editingOrder.createdAt).toLocaleString("vi-VN")}
                </p>
                <p>
                  <strong>Loại đơn:</strong>{" "}
                  {editingOrder.orderType === "Dinein" ? "Tại chỗ" : "Mang về"}
                </p>
                <p className="edit-warning">
                  ⚠️ Bạn có thể điều chỉnh số lượng món ăn
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
                    {editingOrder.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.menuItemName}</td>
                        <td>
                          <div className="quantity-controls-modal">
                            <button
                              className="qty-btn"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>{formatCurrency(item.priceAtOrder)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="order-total-detail">
                <strong>Tổng cộng:</strong>
                <strong>{formatCurrency(editingOrder.totalAmount)}</strong>
              </div>
              <div className="modal-actions">
                <button
                  className="save-btn"
                  onClick={handleSaveOrder}
                  disabled={updatingOrderId === editingOrder.id}
                >
                  {updatingOrderId === editingOrder.id
                    ? "Đang lưu..."
                    : "Lưu thay đổi"}
                </button>
                <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {selectedOrder.orderType === "Dinein" &&
                  selectedOrder.tableName && (
                    <p>
                      <strong>Bàn:</strong> {selectedOrder.tableName}
                    </p>
                  )}
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
