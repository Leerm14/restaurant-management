import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../services/api";
import Button from "../../../components/Button";
import "./OrderHistory.css";

// --- Interfaces ---
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

  // State cho các chức năng cũ
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // State cho chức năng Thanh toán mới
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- Fetch Orders ---
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
        // Sắp xếp đơn mới nhất lên đầu
        setOrders(ordersData.reverse());
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // --- Helper Functions ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Chờ xử lý",
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

  // --- Handlers Cũ (Xem, Sửa, Hủy) ---

  const handleViewDetails = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    // Clone object để tránh mutate trực tiếp state
    setEditingOrder(JSON.parse(JSON.stringify(order)));
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
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

      if (editingOrder.orderType === "Dinein" && editingOrder.tableId) {
        orderCreateRequest.tableId = editingOrder.tableId;
      }

      await apiClient.put(`/api/orders/${editingOrder.id}`, orderCreateRequest);
      alert("Cập nhật đơn hàng thành công!");

      // Refresh orders list
      const response = await apiClient.get(`/api/orders/user/${userId}`);
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      setOrders(ordersData.reverse());
      setEditingOrder(null);
    } catch (error: any) {
      console.error("Error updating order:", error);
      const msg = error.response?.data?.message || "Lỗi cập nhật đơn hàng";
      alert(msg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      await apiClient.patch(`/api/orders/${orderId}/cancel`);
      alert("Đã hủy đơn hàng thành công!");

      // Refresh orders list
      const response = await apiClient.get(`/api/orders/user/${userId}`);
      const ordersData = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
      setOrders(ordersData.reverse());
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // --- Handlers Mới (Thanh toán) ---

  const openPaymentModal = (order: Order) => {
    setPaymentOrderId(order.id);
    setPaymentAmount(order.totalAmount);
    setShowPaymentModal(true);
  };

  const handlePayOS = async () => {
    if (!paymentOrderId) return;
    setIsProcessingPayment(true);
    try {
      const response = await apiClient.post(
        `/api/payments/payos/${paymentOrderId}`
      );
      const data = response.data;

      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Không lấy được link thanh toán. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("PayOS Error:", error);
      alert(error.response?.data || "Lỗi khi tạo thanh toán PayOS");
    } finally {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const handleCashPayment = async () => {
    if (!paymentOrderId) return;
    setIsProcessingPayment(true);
    try {
      await apiClient.post("/api/payments", {
        orderId: paymentOrderId,
        amount: paymentAmount,
        paymentMethod: "Cash",
      });

      alert("Đã gửi yêu cầu! Nhân viên sẽ đến bàn để thu tiền.");
      setShowPaymentModal(false);
    } catch (error: any) {
      console.error("Cash Payment Error:", error);
      if (error.response?.data?.includes("đã có thanh toán")) {
        alert("Bạn đã gửi yêu cầu thanh toán cho đơn này rồi.");
      } else {
        alert(
          "Lỗi khi gửi yêu cầu thanh toán: " +
            (error.response?.data?.message || "Lỗi không xác định")
        );
      }
    } finally {
      setIsProcessingPayment(false);
    }
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
                {orders.map((order, index) => (
                  <tr key={order.id}>
                    <td className="order-id">{index + 1}</td>
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

                        {/* Logic hiển thị nút Sửa/Hủy (Chỉ khi Pending) */}
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

                        {/* Logic hiển thị nút Thanh toán (Chỉ khi Completed) */}
                        {order.status === "Completed" && (
                          <button
                            className="action-button pay-btn"
                            style={{
                              color: "#fff",
                              backgroundColor: "#f39c12",
                              border: "none",
                              borderRadius: "4px",
                              padding: "6px 12px",
                              marginLeft: "5px",
                              fontWeight: "500",
                              cursor: "pointer",
                            }}
                            onClick={() => openPaymentModal(order)}
                          >
                            💳 Thanh toán
                          </button>
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

      {/* --- MODAL THANH TOÁN --- */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="modal-content payment-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <div className="modal-header">
              <h2>Thanh toán đơn #{paymentOrderId}</h2>
              <button
                className="close-button"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: "center" }}>
              <p style={{ marginBottom: "20px", fontSize: "1.1rem" }}>
                Tổng tiền:{" "}
                <strong style={{ color: "#e74c3c" }}>
                  {formatCurrency(paymentAmount)}
                </strong>
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <Button
                  variant="primary"
                  onClick={handlePayOS}
                  disabled={isProcessingPayment}
                  className="w-100"
                >
                  {isProcessingPayment
                    ? "Đang xử lý..."
                    : "💳 Thanh toán Online (PayOS)"}
                </Button>

                <div
                  style={{ borderTop: "1px solid #eee", margin: "5px 0" }}
                ></div>

                <div
                  style={{
                    backgroundColor: "#27ae60",
                    color: "white",
                    borderColor: "#27ae60",
                    borderRadius: "4px",
                  }}
                >
                  <Button
                    variant="secondary"
                    onClick={handleCashPayment}
                    disabled={isProcessingPayment}
                    className="w-100"
                  >
                    💵 Tiền mặt / Gọi nhân viên
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL SỬA ĐƠN HÀNG --- */}
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

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
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
                {selectedOrder.tableName && (
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
                      <th>SL</th>
                      <th>Giá</th>
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
