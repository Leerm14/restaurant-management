import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../services/api";
import "./Cart.css";

interface Booking {
  id: number;
  tableId: number;
  tableName: string;
  bookingTime: string;
  status: string;
}

const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [orderType, setOrderType] = useState<"Dinein" | "Takeaway">("Dinein");

  // Kiểm tra xem user có booking đang active không (chỉ khi chọn Dinein)
  useEffect(() => {
    const checkActiveBooking = async () => {
      if (!userId || orderType === "Takeaway") {
        setLoadingBooking(false);
        setActiveBooking(null);
        return;
      }

      setLoadingBooking(true);
      try {
        // Use user-specific endpoint to fetch this user's bookings
        const response = await apiClient.get(`/api/bookings/user/${userId}`);

        const bookings = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];

        // Only consider bookings for today or later
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const userActiveBooking = bookings.find(
          (booking: any) =>
            (booking.status === "Confirmed" || booking.status === "Pending") &&
            new Date(booking.bookingTime) >= startOfToday
        );

        console.log("User active booking:", userActiveBooking);

        if (userActiveBooking) {
          setActiveBooking({
            id: userActiveBooking.id,
            tableId: userActiveBooking.table?.id,
            tableName: `Bàn ${userActiveBooking.table?.tableNumber}`,
            bookingTime: userActiveBooking.bookingTime,
            status: userActiveBooking.status,
          });
        } else {
          setActiveBooking(null);
        }
      } catch (error) {
        console.error("Error checking active booking:", error);
      } finally {
        setLoadingBooking(false);
      }
    };

    checkActiveBooking();
  }, [userId, orderType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để đặt món");
      navigate("/signin");
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, vui lòng thêm món");
      return;
    }

    // Nếu chọn Dinein mà chưa có booking -> yêu cầu đặt bàn trước
    if (orderType === "Dinein" && !activeBooking) {
      navigate("/booking", { state: { fromCart: true } });
      return;
    }

    try {
      // Map cartItems to OrderItemRequest format
      const orderItems = cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      // Create OrderCreateRequest DTO
      const orderCreateRequest: any = {
        userId: userId,
        orderType: orderType,
        orderItems: orderItems,
      };

      // Chỉ thêm tableId nếu là Dinein
      if (orderType === "Dinein" && activeBooking) {
        orderCreateRequest.tableId = activeBooking.tableId;
      }

      // Call POST /api/orders
      const response = await apiClient.post("/api/orders", orderCreateRequest);

      if (response.status === 201) {
        alert("Đặt món thành công!");
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
        setActiveBooking(null); // Reset booking state
        navigate("/order-history"); // Chuyển đến lịch sử đơn hàng
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.response?.status === 400) {
        alert("Đặt món thất bại: Thông tin không hợp lệ");
      } else if (error.response?.status === 403) {
        alert("Bạn không có quyền đặt món");
      } else {
        alert("Đặt món thất bại, vui lòng thử lại");
      }
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Giỏ Hàng</h1>
          <p className="cart-subtitle">
            {getTotalItems() > 0
              ? `Bạn có ${getTotalItems()} món trong giỏ hàng`
              : "Giỏ hàng của bạn đang trống"}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2 className="cart-empty-title">Giỏ hàng trống</h2>
            <p className="cart-empty-text">
              Hãy thêm món ăn yêu thích vào giỏ hàng của bạn
            </p>
            <Link to="/menu" className="continue-shopping-btn">
              Khám phá menu
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <button
                          className="quantity-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2 className="summary-title">Tổng Đơn Hàng</h2>

              {/* Chọn phương thức */}
              <div className="order-type-selection">
                <h3 className="order-type-title">Phương thức</h3>
                <div className="order-type-buttons">
                  <button
                    className={`order-type-btn ${
                      orderType === "Dinein" ? "active" : ""
                    }`}
                    onClick={() => setOrderType("Dinein")}
                  >
                    🍽️ Tại chỗ
                  </button>
                  <button
                    className={`order-type-btn ${
                      orderType === "Takeaway" ? "active" : ""
                    }`}
                    onClick={() => setOrderType("Takeaway")}
                  >
                    🥡 Mang đi
                  </button>
                </div>
              </div>

              <div className="summary-row">
                <span>Số lượng món:</span>
                <span className="summary-value">{getTotalItems()}</span>
              </div>
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span className="summary-value">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span className="summary-value total">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>

              {/* Hiển thị thông tin booking cho Dinein */}
              {orderType === "Dinein" && (
                <>
                  {loadingBooking ? (
                    <div className="booking-info">
                      <p>Đang kiểm tra đặt bàn...</p>
                    </div>
                  ) : activeBooking ? (
                    <div className="booking-info">
                      <p className="booking-info-title">
                        ✓ Đã có đặt bàn: {activeBooking.tableName}
                      </p>
                      <p className="booking-info-time">
                        Thời gian:{" "}
                        {new Date(activeBooking.bookingTime).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="booking-info warning">
                      <p>⚠️ Chưa có đặt bàn</p>
                      <p className="booking-info-time">
                        Vui lòng đặt bàn trước khi đặt món
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Nút đặt món */}
              <button className="checkout-btn" onClick={handleCheckout}>
                {orderType === "Dinein" && !activeBooking
                  ? "Đặt bàn trước"
                  : "Đặt món ngay"}
              </button>

              <button className="clear-cart-btn" onClick={handleClearCart}>
                Xóa giỏ hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
