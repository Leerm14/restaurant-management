import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import MenuCard from "../../../components/MenuCard.tsx";
import MenuCardHighlight from "../../../components/MenuCardHighlight.tsx";
import Button from "../../../components/Button.tsx";
import {
  getAllMenu,
  getMenuByCategory,
  MenuItem,
} from "../../../services/mockData.ts";

interface Category {
  id: string;
  name: string;
}

const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const allMenu: MenuItem[] = getAllMenu();

  // Lấy menu theo category
  const getFilteredMenu = (): MenuItem[] => {
    if (selectedCategory === "all") {
      return allMenu;
    }
    return getMenuByCategory(selectedCategory);
  };

  // Lấy 3 món nổi bật đầu tiên
  const featuredMenu: MenuItem[] = allMenu.slice(0, 3);

  // Lấy menu thường (từ món thứ 4 trở đi)
  const regularMenu: MenuItem[] = getFilteredMenu().slice(3);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (item: {
    title: string;
    price: string;
    image: string;
  }) => {
    console.log("Đã thêm vào giỏ hàng:", item);
    alert(`Đã thêm ${item.title} vào giỏ hàng!`);
  };

  // Xử lý scroll đến full menu section
  const scrollToFullMenu = () => {
    const fullMenuSection = document.getElementById("full-menu-section");
    if (fullMenuSection) {
      fullMenuSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Categories cho filter
  const categories: Category[] = [
    { id: "all", name: "Tất cả" },
    { id: "Hải sản", name: "Hải sản" },
    { id: "Salad", name: "Salad" },
    { id: "Lẩu", name: "Lẩu" },
    { id: "Món chính", name: "Món chính" },
    { id: "Đồ uống", name: "Đồ uống" },
  ];

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero">
        <div className="menu-hero-overlay">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">Khám Phá Hương Vị Tuyệt Hảo</h1>
              <p className="hero-subtitle">
                Chào mừng đến với nhà hàng của chúng tôi - nơi mỗi món ăn là một
                câu chuyện
              </p>
              <Button variant="primary" onClick={scrollToFullMenu}>
                Xem Menu
              </Button>
            </div>

            {/* Featured dishes circles */}
            <div className="hero-dishes">
              {allMenu.slice(0, 6).map((dish, index) => (
                <div
                  key={dish.id}
                  className={`hero-dish hero-dish-${index + 1}`}
                >
                  <img src={dish.image} alt={dish.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="featured-menu-section">
        <div className="container">
          <h2 className="section-title">Món Nổi Bật</h2>
          <div className="menu-grid-highlight">
            {featuredMenu.map((menuItem) => (
              <MenuCardHighlight
                key={menuItem.id}
                image={menuItem.image}
                title={menuItem.name}
                description={menuItem.description}
                price={menuItem.price}
                alt={menuItem.name}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Full Menu Section */}
      <section id="full-menu-section" className="full-menu-section">
        <div className="container">
          <h2 className="section-title">Toàn Bộ Menu</h2>

          {/* Category Filter */}
          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="menu-grid">
            {regularMenu.map((menuItem) => (
              <MenuCard
                key={menuItem.id}
                image={menuItem.image}
                title={menuItem.name}
                description={menuItem.description}
                price={menuItem.price}
                alt={menuItem.name}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="menu-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Bạn đã sẵn sàng để trải nghiệm?</h2>
            <p>
              Hãy đến với chúng tôi để thưởng thức những hương vị tuyệt vời
              nhất!
            </p>
            <Link to="/booking">
              <Button variant="primary">Đặt bàn ngay</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
