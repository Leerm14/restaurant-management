import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import MenuCard from "../../../components/MenuCard.tsx";
import MenuCardHighlight from "../../../components/MenuCardHighlight.tsx";
import Button from "../../../components/Button.tsx";
import apiClient from "../../../services/api";
import { useCart } from "../../../contexts/CartContext";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  status: "available" | "unavailable";
  image: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
}

const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "T\u1ea5t c\u1ea3" },
  ]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/api/categories");
        const cats: Category[] = response.data.map((cat: any) => ({
          id: cat.id.toString(),
          name: cat.name,
        }));
        setCategories([{ id: "all", name: "Tất cả" }, ...cats]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedCategory !== "all") {
          response = await apiClient.get(
            `/api/menu/category/${selectedCategory}`,
            {
              params: {
                page: 0,
                size: 100,
              },
            }
          );
        } else {
          response = await apiClient.get("/api/menu", {
            params: {
              available: true,
              page: 0,
              size: 100,
            },
          });
        }

        const items: MenuItem[] = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category?.name || "Khác",
          status: item.status?.toLowerCase() as "available" | "unavailable",
          image:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
          description: item.description || "",
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [selectedCategory]);

  // Lấy menu theo category
  const getFilteredMenu = (): MenuItem[] => {
    return menuItems.filter((item) => item.status === "available");
  };

  // Lấy 3 món nổi bật đầu tiên
  const filteredMenu = getFilteredMenu();
  const featuredMenu: MenuItem[] = filteredMenu.slice(0, 3);

  // Lấy menu thường (từ món thứ 4 trở đi)
  const regularMenu: MenuItem[] = filteredMenu.slice(3);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (item: {
    title: string;
    price: string;
    image: string;
  }) => {
    const menuItem = menuItems.find((m) => m.name === item.title);
    if (menuItem) {
      addToCart({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
      });
      alert(`Đã thêm ${item.title} vào giỏ hàng!`);
    }
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

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <section className="menu-hero">
        <div className="menu-hero-overlay">
          <div className="menu-container">
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
              {menuItems.slice(0, 6).map((dish, index) => (
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
        <div className="menu-container">
          <h2 className="section-title">Món Nổi Bật</h2>
          <div className="menu-grid-highlight">
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  gridColumn: "1 / -1",
                }}
              >
                Đang tải...
              </div>
            ) : featuredMenu.length > 0 ? (
              featuredMenu.map((menuItem) => (
                <MenuCardHighlight
                  key={menuItem.id}
                  image={menuItem.image}
                  title={menuItem.name}
                  description={menuItem.description || ""}
                  price={menuItem.price}
                  category={menuItem.category}
                  alt={menuItem.name}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  gridColumn: "1 / -1",
                }}
              >
                Không có món nổi bật
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full Menu Section */}
      <section id="full-menu-section" className="full-menu-section">
        <div className="menu-container">
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
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  gridColumn: "1 / -1",
                }}
              >
                Đang tải...
              </div>
            ) : regularMenu.length > 0 ? (
              regularMenu.map((menuItem) => (
                <MenuCard
                  key={menuItem.id}
                  image={menuItem.image}
                  title={menuItem.name}
                  description={menuItem.description || ""}
                  price={menuItem.price}
                  category={menuItem.category}
                  alt={menuItem.name}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  gridColumn: "1 / -1",
                }}
              >
                Không có món ăn
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="menu-cta-section">
        <div className="menu-container">
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
