import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.css";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    // Có thể gọi API để xác nhận thanh toán ở đây nếu cần
  }, []);

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  return (
    <div className="payment-result-page">
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
              className="btn btn-primary"
              onClick={() => navigate("/order-history")}
            >
              Xem đơn hàng
            </button>
            <button
              className="btn btn-secondary"
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
