import React, { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./404.scss";

const NotFoundPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    // Kiểm tra độ rộng màn hình (logic tương tự windowWidth < 768)
    if (window.innerWidth < 768) return;

    // Lấy kích thước và vị trí của container
    const rect = container.getBoundingClientRect();
    const halfFieldWidth = rect.width / 2;
    const halfFieldHeight = rect.height / 2;

    // Tính toán vị trí chuột tương đối trong container
    // e.clientX là tọa độ viewport, trừ đi rect.left để ra tọa độ trong thẻ div
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = (mouseX - halfFieldWidth) / 30;
    const newY = (mouseY - halfFieldHeight) / 30;

    // Tìm tất cả các phần tử có class chứa chữ "wave" bên trong container
    const waveElements =
      container.querySelectorAll<HTMLElement>('[class*="wave"]');

    waveElements.forEach((el, index) => {
      el.style.transition = ""; // Tắt transition để di chuyển mượt theo chuột
      el.style.transform = `translate3d(${index * newX}px, ${
        index * newY
      }px, 0px)`;
    });
  }, []);

  // Xử lý khi chuột rời khỏi vùng container (Reset vị trí)
  const handleMouseLeave = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const waveElements =
      container.querySelectorAll<HTMLElement>('[class*="wave"]');

    waveElements.forEach((el) => {
      el.style.transform = "translate(0px, 0px)";
      el.style.transition = "all 0.7s";
    });

    // Sau 0.7s (timeout), xóa transition để chuẩn bị cho lần di chuột tiếp theo
    setTimeout(() => {
      waveElements.forEach((el) => {
        el.style.transition = "";
      });
    }, 700);
  }, []);

  return (
    <div
      className="not-found parallax"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sky-bg"></div>
      <div className="wave-7"></div>
      <div className="wave-6"></div>

      <Link to="/" className="wave-island">
        <img
          src="http://res.cloudinary.com/andrewhani/image/upload/v1524501929/404/island.svg"
          alt="Island"
        />
      </Link>

      <div className="wave-5"></div>
      <div className="wave-lost wrp">
        <span>4</span>
        <span>0</span>
        <span>4</span>
      </div>

      <div className="wave-4"></div>
      <div className="wave-boat">
        <img
          className="boat"
          src="http://res.cloudinary.com/andrewhani/image/upload/v1524501894/404/boat.svg"
          alt="Boat"
        />
      </div>

      <div className="wave-3"></div>
      <div className="wave-2"></div>
      <div className="wave-1"></div>

      <div className="wave-message">
        <p>You're lost</p>
        <p>Click on the island to return</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
