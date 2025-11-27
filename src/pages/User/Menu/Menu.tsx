import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import MenuCard from "../../../components/MenuCard";
import MenuCardHighlight from "../../../components/MenuCardHighlight";
import Button from "../../../components/Button";
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
  color: string;
}

const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/api/categories");
        const cats: Category[] = response.data.map((cat: any) => {
          const randomColor =
            "#" +
            Math.floor(Math.random() * 0x1000000)
              .toString(16)
              .padStart(6, "0");

          return {
            id: cat.id.toString(),
            name: cat.name,
            color: randomColor,
          };
        });
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setCurrentPage(0);
      try {
        let response;

        if (selectedCategory !== "all") {
          response = await apiClient.get(
            `/api/menu/category/${selectedCategory}`,
            {
              params: {
                page: 0,
                size: 1000,
              },
            }
          );
        } else {
          response = await apiClient.get("/api/menu", {
            params: {
              available: true,
              page: 0,
              size: 1000,
            },
          });
        }

        const rawItems = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];

        const items: MenuItem[] = rawItems
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category?.name || "Khác",
            status: item.status?.toLowerCase() as "available" | "unavailable",
            image:
              item.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
            description: item.description || "",
          }))
          .filter((item: MenuItem) => item.status === "available");

        setAllMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setAllMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [selectedCategory]);

  const pageCount = Math.ceil(allMenuItems.length / itemsPerPage);

  const paginatedItems = allMenuItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const featuredMenu = allMenuItems.slice(0, 3);

  const handleAddToCart = (item: {
    title: string;
    price: string;
    image: string;
  }) => {
    const menuItem = allMenuItems.find((m) => m.name === item.title);
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

            <div className="hero-dishes">
              {allMenuItems.slice(0, 6).map((dish, index) => (
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

      {featuredMenu.length > 0 && (
        <section className="featured-menu-section">
          <div className="menu-container">
            <h2 className="section-title">Món Nổi Bật</h2>
            <div className="menu-grid-highlight">
              {loading ? (
                <div style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                  Đang tải...
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </section>
      )}

      <section id="full-menu-section" className="full-menu-section">
        <div className="menu-container">
          <h2 className="section-title">Toàn Bộ Menu</h2>

          <div className="category-filter">
            <button
              className={`filter-btn ${
                selectedCategory === "all" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("all")}
              style={{
                backgroundColor:
                  selectedCategory === "all" ? "#4CAF50" : "transparent",
                borderColor: "#4CAF50",
                color: selectedCategory === "all" ? "white" : "#4CAF50",
              }}
            >
              Tất cả
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color
                      : "transparent",
                  borderColor: category.color,
                  color:
                    selectedCategory === category.id ? "white" : category.color,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

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
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((menuItem) => (
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

          {pageCount > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <i className="fas fa-chevron-left"></i> Trước
              </button>

              <div className="page-numbers">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    className={`page-number ${
                      currentPage === i ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage(Math.min(pageCount - 1, currentPage + 1))
                }
                disabled={currentPage === pageCount - 1}
              >
                Sau <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>

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
