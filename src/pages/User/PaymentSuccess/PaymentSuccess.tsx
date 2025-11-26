import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../../services/api";
import "./PaymentSuccess.css";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Thêm trạng thái đang xác thực
  const [isValidating, setIsValidating] = useState(true);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    const validateAndConfirmPayment = async () => {
      // Nếu không có orderId, đuổi về trang chủ hoặc trang lỗi
      if (!orderId) {
        navigate("/");
        return;
      }

      try {
        // Bước 1: Lấy thông tin payment hiện tại từ Database
        const paymentRes = await apiClient.get(
          `/api/payments/order/${orderId}`
        );
        const payment = paymentRes.data;

        if (payment.status === "Successful") {
          // Trường hợp 1: Đã thành công (ví dụ Webhook đã chạy trước đó)
          setIsValidating(false); // Cho phép hiển thị trang
        } else if (payment.status === "Pending") {
          // Trường hợp 2: Vẫn đang chờ (Webhook chưa tới hoặc chạy Localhost)
          // Gọi API confirm để cập nhật trạng thái
          try {
            await apiClient.patch(`/api/payments/${payment.id}/confirm`);
            // Confirm thành công -> Cho phép hiển thị
            setIsValidating(false);
            console.log("Đã xác nhận thanh toán thành công từ Client.");
          } catch (err) {
            console.error("Lỗi khi confirm payment:", err);
            // Confirm thất bại -> Đẩy sang trang Failed
            navigate(
              `/payment/payment-failed?orderId=${orderId}&reason=ConfirmFailed`
            );
          }
        } else {
          // Trường hợp 3: Trạng thái là Failed hoặc Cancelled
          // Đẩy sang trang Failed ngay lập tức
          navigate(
            `/payment/payment-failed?orderId=${orderId}&reason=Status_${payment.status}`
          );
        }
      } catch (error) {
        console.error("Lỗi kết nối hoặc không tìm thấy đơn hàng:", error);
        navigate("/menu");
      }
    };

    validateAndConfirmPayment();
  }, [orderId, navigate]);

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  // --- MÀN HÌNH CHỜ (LOADING) ---
  // Nếu đang validate, hiển thị spinner thay vì nội dung thành công
  if (isValidating) {
    return (
      <div className="payment-result-page success">
        <div className="payment-result-container">
          <div
            className="payment-result-card"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #11998e",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
            <h2 style={{ color: "#2c3e50", fontSize: "1.5rem" }}>
              Đang xác thực giao dịch...
            </h2>
            <p style={{ color: "#6c757d" }}>Vui lòng không tắt trình duyệt.</p>
          </div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- MÀN HÌNH THÀNH CÔNG (Chỉ hiện khi isValidating = false) ---
  return (
    <div className="payment-result-page success">
      <div className="payment-result-container">
        <div className="payment-result-card success">
          <div className="success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 className="result-title">Thanh toán thành công!</h1>
          <p className="result-message">
            Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận.
          </p>

          <div className="payment-details">
            {orderId && (
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">#{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="detail-row">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value amount">
                  {formatCurrency(amount)}
                </span>
              </div>
            )}
            {transactionId && (
              <div className="detail-row">
                <span className="detail-label">Mã giao dịch:</span>
                <span className="detail-value">{transactionId}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Thời gian:</span>
              <span className="detail-value">
                {new Date().toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="payment-success-btn btn-primary"
              onClick={() => navigate("/order-history")}
            >
              Xem đơn hàng
            </button>
            <button
              className="payment-success-btn btn-secondary"
              onClick={() => navigate("/menu")}
            >
              Tiếp tục đặt món
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
