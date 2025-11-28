import React, { useState, useEffect } from "react";
import apiClient from "../../services/api";

interface RevenueReport {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  cashRevenue: number;
  cashTransactions: number;
  qrCodeRevenue: number;
  qrCodeTransactions: number;
  creditCardRevenue: number;
  creditCardTransactions: number;
}

interface MonthlyStats {
  year: number;
  month: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    Pending: number;
    Confirmed: number;
    Completed: number;
    Cancelled: number;
  };
}

interface BestSellingItem {
  menuItemId: number;
  menuItemName: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

interface OrderReportItem {
  id: number;
  userFullName: string;
  tableName: string;
  totalAmount: number;
  status: string;
  orderType: string;
  createdAt: string;
  paymentStatus?: string;
}

const AdminReports: React.FC = () => {
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(
    null
  );
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [bestSelling, setBestSelling] = useState<BestSellingItem[]>([]);
  const [orders, setOrders] = useState<OrderReportItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-01-01`);
  const [toDate, setToDate] = useState(`${currentYear}-12-31`);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadRevenueReport();
  }, [fromDate, toDate]);

  useEffect(() => {
    loadMonthlyStats();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadBestSelling();
  }, [limit]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadRevenueReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/payments/revenue-report", {
        params: { fromDate, toDate },
      });
      setRevenueReport(response.data);
    } catch (err: any) {
      console.error("Error loading revenue report:", err);
      setError(
        err.response?.data?.message || "Không thể tải báo cáo doanh thu"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/orders/stats/monthly", {
        params: { year: selectedYear, month: selectedMonth },
      });
      setMonthlyStats(response.data);
    } catch (err: any) {
      console.error("Error loading monthly stats:", err);
      setError(err.response?.data?.message || "Không thể tải thống kê tháng");
    } finally {
      setLoading(false);
    }
  };

  const loadBestSelling = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/menu/best-selling", {
        params: { limit },
      });
      setBestSelling(response.data);
    } catch (err: any) {
      console.error("Error loading best selling:", err);
      setError(err.response?.data?.message || "Không thể tải món bán chạy");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/orders");
      const sortedOrders = (response.data as OrderReportItem[]).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getMonthName = (month: number) => {
    return `Tháng ${month}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "#22c55e";
      case "Cancelled":
        return "#ef4444";
      case "Pending":
        return "#f59e0b";
      case "Confirmed":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div
      className="admin-reports"
      style={{ padding: "20px", maxWidth: "1600px", margin: "0 auto" }}
    >
      <h1 style={{ fontSize: "2rem", color: "#1f2937", marginBottom: "30px" }}>
        Thống kê & Báo cáo
      </h1>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #dc2626",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>Năm:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>Tháng:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={loadMonthlyStats}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tải lại
        </button>
      </div>

      {monthlyStats && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              color: "#1f2937",
              marginBottom: "20px",
            }}
          >
            Tổng quan {getMonthName(monthlyStats.month)}/{monthlyStats.year}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Tổng đơn hàng
              </div>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                {monthlyStats.totalOrders}
              </div>
            </div>
            {monthlyStats.ordersByStatus &&
              Object.entries(monthlyStats.ordersByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    style={{
                      background: "white",
                      padding: "20px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      borderTop: `4px solid ${getStatusColor(status)}`,
                    }}
                  >
                    <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                      {status}
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginTop: "5px",
                      }}
                    >
                      {count}
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ width: "100%", margin: "0 0 10px 0" }}>
          Lọc doanh thu theo ngày
        </h3>
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>Từ:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: "10px" }}>Đến:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
        </div>
        <button
          onClick={loadRevenueReport}
          style={{
            padding: "8px 16px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Xem báo cáo
        </button>
      </div>

      {revenueReport && (
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Tổng doanh thu
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  color: "#10b981",
                  marginTop: "5px",
                }}
              >
                {formatCurrency(revenueReport.totalRevenue)}
              </div>
            </div>
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Số giao dịch
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  color: "#3b82f6",
                  marginTop: "5px",
                }}
              >
                {revenueReport.totalTransactions}
              </div>
            </div>
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Tiền mặt
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#f59e0b",
                  marginTop: "5px",
                }}
              >
                {formatCurrency(revenueReport.cashRevenue)}
              </div>
            </div>
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Chuyển khoản (PayOS)
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#8b5cf6",
                  marginTop: "5px",
                }}
              >
                {formatCurrency(revenueReport.qrCodeRevenue)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "#1f2937" }}>
            Top món bán chạy
          </h2>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Hạng
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Tên món
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Giá
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Đã bán
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {bestSelling.map((item, index) => (
                <tr
                  key={item.menuItemId}
                  style={{ borderTop: "1px solid #e5e7eb" }}
                >
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        background: index < 3 ? "#fbbf24" : "#f3f4f6",
                        color: index < 3 ? "white" : "#374151",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                      }}
                    >
                      #{index + 1}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 500 }}>
                    {item.menuItemName}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    {formatCurrency(item.price)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {item.totalQuantitySold}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "#1f2937" }}>
            Danh sách toàn bộ đơn hàng
          </h2>
          <button
            onClick={loadOrders}
            style={{
              padding: "8px 16px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px",
            }}
          >
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Ngày tạo
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Khách hàng
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Loại / Bàn
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Tổng tiền
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Thanh toán
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Không có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "16px", fontWeight: 600 }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: "16px", color: "#374151" }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 500 }}>
                        {order.userFullName || "Khách lẻ"}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          background:
                            order.orderType === "Dinein"
                              ? "#e0f2fe"
                              : "#fff7ed",
                          color:
                            order.orderType === "Dinein"
                              ? "#0369a1"
                              : "#c2410c",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          marginRight: "8px",
                        }}
                      >
                        {order.orderType === "Dinein" ? "Tại bàn" : "Mang về"}
                      </span>
                      {order.tableName && (
                        <span style={{ fontSize: "0.9rem", color: "#4b5563" }}>
                          {order.tableName}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      {order.paymentStatus === "Successful" ? (
                        <span
                          style={{
                            color: "#10b981",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          ✓ Đã TT
                        </span>
                      ) : (
                        <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
                          Chưa TT
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(order.status),
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
