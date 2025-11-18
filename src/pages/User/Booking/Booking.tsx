import React, { useState, ChangeEvent, FormEvent } from "react";
import "./Booking.css";
import Button from "../../../components/Button.tsx";

interface Table {
  id: number;
  name: string;
  status: "available" | "occupied";
}

interface CustomerInfo {
  name: string;
  phone: string;
  note: string;
}

const Booking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    note: "",
  });

  // Time slots available
  const timeSlots: string[] = [
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
  ];

  // Table data with status
  const tables: Table[] = [
    { id: 1, name: "Bàn 1", status: "available" },
    { id: 2, name: "Bàn 2", status: "available" },
    { id: 3, name: "Bàn 3", status: "occupied" },
    { id: 4, name: "Bàn 4", status: "available" },
    { id: 5, name: "Bàn 5", status: "available" },
    { id: 6, name: "Bàn 6", status: "occupied" },
    { id: 7, name: "Bàn 7", status: "available" },
    { id: 8, name: "Bàn 8", status: "available" },
    { id: 9, name: "Bàn 9", status: "available" },
    { id: 10, name: "Bàn 10", status: "occupied" },
    { id: 11, name: "Bàn 11", status: "available" },
    { id: 12, name: "Bàn 12", status: "available" },
  ];

  // Handle table selection
  const handleTableSelect = (table: Table) => {
    if (table.status === "available") {
      setSelectedTable(table.id);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedTable ||
      !customerInfo.name ||
      !customerInfo.phone
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Here you would typically send the booking data to your backend
    console.log("Booking data:", {
      date: selectedDate,
      time: selectedTime,
      table: selectedTable,
      customer: customerInfo,
    });

    alert("Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm.");

    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setSelectedTable(null);
    setCustomerInfo({ name: "", phone: "", note: "" });
  };

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <h1 className="booking-title">Đặt Bàn Dễ Dàng</h1>
          <p className="booking-subtitle">
            Chọn ngày, giờ và bàn yêu thích của bạn để có một trải nghiệm ẩm
            thực tuyệt vời
          </p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          {/* Date Selection */}
          <div className="form-section">
            <h3 className="section-title">Chọn ngày</h3>
            <div className="date-input">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="date-picker"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="form-section">
            <h3 className="section-title">Chọn giờ</h3>
            <div className="time-slots">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`time-slot ${
                    selectedTime === time ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Table Selection */}
          <div className="form-section">
            <h3 className="section-title">Chọn bàn</h3>
            <div className="tables-grid">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`table-item ${table.status} ${
                    selectedTable === table.id ? "selected" : ""
                  }`}
                  onClick={() => handleTableSelect(table)}
                >
                  <div className="table-icon">🪑</div>
                  <span className="table-name">{table.name}</span>
                  <span className="table-status">
                    {table.status === "available" ? "Còn trống" : "Đã có khách"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="form-section">
            <h3 className="section-title">Thông tin của bạn</h3>
            <div className="customer-info">
              <div className="form-group">
                <label>Tên của bạn</label>
                <input
                  type="text"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên của bạn"
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="0123 456 789"
                  required
                />
              </div>

              <div className="form-group">
                <label>Yêu cầu đặc biệt (tùy chọn)</label>
                <textarea
                  name="note"
                  value={customerInfo.note}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Bàn gần cửa sổ, không gian riêng tư, thích từng bước thức..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-submit">
            <Button variant="primary">✓ Xác nhận đặt bàn</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
