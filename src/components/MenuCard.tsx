import React from "react";
import "./Components.css";
import Button from "./Button.tsx";

interface MenuCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  category?: string;
  alt?: string;
  onAddToCart?: (item: { title: string; price: string; image: string }) => void;
}

// Component MenuCard tái sử dụng cho hiển thị món ăn
const MenuCard: React.FC<MenuCardProps> = ({
  image,
  title,
  description,
  price,
  category,
  alt,
  onAddToCart,
}) => {
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ title, price, image });
    }
  };

  return (
    <div className="menu-item">
      <div className="menu-image">
        <img src={image} alt={alt || title} />
      </div>
      <div className="menu-info">
        <h3>{title}</h3>
        {category && <span className="menu-category">{category}</span>}
        <p>{description}</p>
        <div className="price-action">
          <span className="price">{price}</span>
          <Button variant="primary" onClick={handleAddToCart}>
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
