import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentFailed.css";

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");
  const errorCode = searchParams.get("errorCode");

  return (
    <div className="payment-result-page failed">
      <div className="payment-result-container">
        <div className="payment-result-card failed">
          <div className="success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>

          <h1 className="result-title">Thanh toán thất bại!</h1>
          <p className="result-message">
            Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại.
          </p>

          <div className="payment-details">
            {orderId && (
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">#{orderId}</span>
              </div>
            )}
            {errorCode && (
              <div className="detail-row">
                <span className="detail-label">Mã lỗi:</span>
                <span className="detail-value">{errorCode}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Lý do:</span>
              <span className="detail-value">
                {reason || "Giao dịch bị từ chối hoặc hủy bỏ"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Thời gian:</span>
              <span className="detail-value">
                {new Date().toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="error-info">
            <p className="error-suggestions">
              <strong>Một số lý do có thể xảy ra:</strong>
            </p>
            <ul className="error-list">
              <li>Số dư tài khoản không đủ</li>
              <li>Thông tin thẻ không chính xác</li>
              <li>Giao dịch bị ngân hàng từ chối</li>
              <li>Phiên thanh toán đã hết hạn</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/order-history")}
            >
              Thử lại
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/menu")}
            >
              Quay lại menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
