import React, { useState, useEffect } from "react";
import "./AdminBooking.css";
import apiClient from "../../services/api";

interface Booking {
  id: number;
  userId: number;
  userName: string;
  tableId: number;
  tableName: string;
  bookingTime: string;
  numGuests: number;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
}

interface BookingCreateRequest {
  userId?: number;
  tableId: number;
  bookingTime: string;
  numGuests: number;
}

const AdminBooking: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    tableId: 0,
    bookingTime: "",
    numGuests: 2,
  });

  useEffect(() => {
    loadBookings();
  }, [currentPage, pageSize]);

  // API 2: Lấy tất cả đặt bàn
  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/bookings", {
        params: { page: currentPage, size: pageSize },
      });
      setBookings(response.data);
    } catch (err: any) {
      console.error("Error loading bookings:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách đặt bàn"
      );
    } finally {
      setLoading(false);
    }
  };

  // API 1: Tạo đặt bàn mới
  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/api/bookings", formData);
      setShowAddModal(false);
      setFormData({
        tableId: 0,
        bookingTime: "",
        numGuests: 2,
      });
      loadBookings();
    } catch (err: any) {
      console.error("Error creating booking:", err);
      setError(err.response?.data?.message || "Không thể tạo đặt bàn mới");
    } finally {
      setLoading(false);
    }
  };

  // API 7: Cập nhật đặt bàn
  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setLoading(true);
    setError("");
    try {
      await apiClient.put(`/api/bookings/${selectedBooking.id}`, formData);
      setShowEditModal(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      console.error("Error updating booking:", err);
      setError(err.response?.data?.message || "Không thể cập nhật đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  // API 7.1: Hủy đặt bàn
  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt bàn này?")) return;

    setLoading(true);
    setError("");
    try {
      await apiClient.put(`/api/bookings/${id}/cancel`);
      loadBookings();
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      setError(err.response?.data?.message || "Không thể hủy đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  // API 8: Hoàn thành đặt bàn
  const handleCompleteBooking = async (id: number) => {
    if (!window.confirm("Xác nhận hoàn thành đặt bàn này?")) return;

    setLoading(true);
    setError("");
    try {
      await apiClient.put(`/api/bookings/${id}/complete`);
      loadBookings();
    } catch (err: any) {
      console.error("Error completing booking:", err);
      setError(err.response?.data?.message || "Không thể hoàn thành đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  // API 9: Xóa đặt bàn
  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đặt bàn này?")) return;

    setLoading(true);
    setError("");
    try {
      await apiClient.delete(`/api/bookings/${id}`);
      loadBookings();
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      setError(err.response?.data?.message || "Không thể xóa đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  // API 6: Tìm kiếm theo số điện thoại
  const handleSearchByPhone = async () => {
    if (!searchTerm.trim()) {
      loadBookings();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get(`/api/bookings/phone/${searchTerm}`);
      setBookings(response.data);
    } catch (err: any) {
      console.error("Error searching bookings:", err);
      setError(err.response?.data?.message || "Không tìm thấy đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      tableId: booking.tableId,
      bookingTime: booking.bookingTime,
      numGuests: booking.numGuests,
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Confirmed":
        return "#3b82f6";
      case "Completed":
        return "#22c55e";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";
      case "Confirmed":
        return "Đã xác nhận";
      case "Completed":
        return "Hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchStatus =
      filterStatus === "all" || booking.status === filterStatus;
    const matchSearch =
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tableName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-booking">
      <div className="booking-header">
        <h1>Quản lý đặt bàn</h1>
        <button
          className="btn-add-booking"
          onClick={() => setShowAddModal(true)}
        >
          + Tạo đặt bàn mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filter */}
      <div className="booking-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng hoặc tên bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearchByPhone}>Tìm kiếm</button>
          <button onClick={loadBookings}>Làm mới</button>
        </div>

        <div className="filter-box">
          <label>Trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Tên bàn</th>
                <th>Số khách</th>
                <th>Thời gian đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.userName}</td>
                  <td>{booking.tableName}</td>
                  <td>{booking.numGuests}</td>
                  <td>
                    {new Date(booking.bookingTime).toLocaleString("vi-VN")}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(booking.status),
                      }}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {booking.status === "Pending" && (
                        <>
                          <button
                            className="btn-complete"
                            onClick={() => handleCompleteBooking(booking.id)}
                            title="Xác nhận hoàn thành"
                          >
                            ✓
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking.id)}
                            title="Hủy"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(booking)}
                        disabled={loading}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={loading}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          ← Trước
        </button>
        <span>Trang {currentPage + 1}</span>
        <button onClick={() => setCurrentPage((prev) => prev + 1)}>
          Sau →
        </button>
      </div>

      {/* Modal thêm đặt bàn */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo đặt bàn mới</h2>
            <form onSubmit={handleAddBooking}>
              <div className="form-group">
                <label>Số bàn:</label>
                <input
                  type="number"
                  required
                  value={formData.tableId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số khách:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numGuests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numGuests: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thời gian đặt:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.bookingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingTime: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang tạo..." : "Tạo đặt bàn"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa đặt bàn */}
      {showEditModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa đặt bàn #{selectedBooking.id}</h2>
            <form onSubmit={handleUpdateBooking}>
              <div className="form-group">
                <label>Số bàn:</label>
                <input
                  type="number"
                  required
                  value={formData.tableId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số khách:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numGuests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numGuests: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thời gian đặt:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.bookingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingTime: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooking;
