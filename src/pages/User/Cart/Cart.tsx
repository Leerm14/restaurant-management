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

  // Kiểm tra xem user có booking đang active không
  useEffect(() => {
    const checkActiveBooking = async () => {
      if (!userId) {
        setLoadingBooking(false);
        return;
      }

      try {
        const response = await apiClient.get("/api/bookings", {
          params: {
            page: 0,
            size: 10,
          },
        });

        const bookings = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];

        const userActiveBooking = bookings.find(
          (booking: any) =>
            booking.user?.id === userId &&
            (booking.status === "Confirmed" || booking.status === "Pending")
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
        }
      } catch (error) {
        console.error("Error checking active booking:", error);
      } finally {
        setLoadingBooking(false);
      }
    };

    checkActiveBooking();
  }, [userId]);

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

    if (!activeBooking) {
      // Chưa có booking -> yêu cầu đặt bàn trước
      navigate("/booking", { state: { fromCart: true } });
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, vui lòng thêm món");
      return;
    }

    try {
      // Map cartItems to OrderItemRequest format
      const orderItems = cartItems.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      // Create OrderCreateRequest DTO
      const orderCreateRequest = {
        userId: userId,
        tableId: activeBooking.tableId,
        orderType: "dine-in", // Đặt bàn tại nhà hàng
        orderItems: orderItems,
      };

      // Call POST /api/orders
      const response = await apiClient.post("/api/orders", orderCreateRequest);

      if (response.status === 201) {
        alert("Đặt món thành công!");
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
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

              {loadingBooking ? (
                <button className="checkout-btn" disabled>
                  Đang kiểm tra...
                </button>
              ) : activeBooking ? (
                <>
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
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Đặt món ngay
                  </button>
                </>
              ) : (
                <button className="checkout-btn" onClick={handleCheckout}>
                  Đặt bàn trước
                </button>
              )}
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
