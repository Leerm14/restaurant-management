import React, { useState, useEffect } from "react";
import "./Home.css";
import Button from "../../../components/Button.tsx";
import MenuCardHighlight from "../../../components/MenuCardHighlight.tsx";
import { Link } from "react-router-dom";
import apiClient from "../../../services/api";
import { useCart } from "../../../contexts/CartContext";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "available" | "unavailable";
  image: string;
  description?: string;
}

const Home: React.FC = () => {
  const [featuredMenu, setFeaturedMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  useEffect(() => {
    const fetchFeaturedMenu = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/api/menu", {
          params: {
            available: true,
            page: 0,
            size: 3,
          },
        });

        const items: MenuItem[] = response.data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price,
          category: item.category?.name || "Kh\u00e1c",
          status: item.status?.toLowerCase() as "available" | "unavailable",
          image:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
          description: item.description || "",
        }));
        setFeaturedMenu(items);
      } catch (error) {
        console.error("Error fetching featured menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedMenu();
  }, []);

  const handleAddToCart = (item: {
    title: string;
    price: string;
    image: string;
  }) => {
    const menuItem = featuredMenu.find((m) => m.name === item.title);
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

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Nhà hàng Hương Vị</h1>
            <p className="hero-subtitle">Hương vị đặc biệt từ từng món ăn</p>
            <Button variant="primary" className="pt-4">
              <Link to="/menu" className="nav-link">
                Khám phá menu
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title">Chào mừng đến với Hương Vị</h2>
            <p className="about-description">
              Chúng tôi tự hào là một trong những nhà hàng hàng đầu với hương vị
              đặc trưng và không gian sang trọng. Được thành lập từ năm 2010,
              nhà hàng đã phục vụ hàng ngàn thực khách với những món ăn đậm đà
              hương vị truyền thống kết hợp cùng phong cách hiện đại. Chúng tôi
              cam kết mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất.
            </p>

            <div className="chef-story">
              <div className="chef-image">
                <img src="/src/assets/home/chef.png" alt="Chef" />
              </div>
              <div className="chef-content">
                <h3>Câu Chuyện Của Chúng Tôi</h3>
                <p>
                  Với hơn 15 năm kinh nghiệm trong nghề, đầu bếp chính của chúng
                  tôi đã tạo nên những công thức độc đáo, kết hợp giữa hương vị
                  truyền thống và hiện đại. Mỗi món ăn đều được chế biến tỉ mỉ
                  từ những nguyên liệu tươi ngon nhất, đảm bảo chất lượng và
                  hương vị đặc biệt.
                </p>
                <p>
                  Nhà hàng không chỉ là nơi thưởng thức ẩm thực mà còn là không
                  gian để gia đình và bạn bè gặp gỡ, chia sẻ những khoảnh khắc
                  đáng nhớ bên những món ăn ngon và dịch vụ tận tâm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="menu-preview">
        <div className="container">
          <h2 className="section-title">
            Th\u1ef1c \u0110\u01a1n N\u1ed5i B\u1eadt
          </h2>
          <div className="menu-grid-highlight">
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  gridColumn: "1 / -1",
                }}
              >
                \u0110ang t\u1ea3i...
              </div>
            ) : featuredMenu.length > 0 ? (
              featuredMenu.map((menuItem) => (
                <MenuCardHighlight
                  key={menuItem.id}
                  image={menuItem.image}
                  title={menuItem.name}
                  description={menuItem.description || ""}
                  price={menuItem.price.toString()}
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
                Kh\u00f4ng c\u00f3 m\u00f3n n\u1ed5i b\u1eadt
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Đăng Ký Nhận Tin Của Chúng Tôi</h2>
            <p>
              Nhận những tin tức mới nhất về các món ăn đặc biệt và các chương
              trình khuyến mãi hấp dẫn từ nhà hàng chúng tôi
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="email-input"
              />
              <button className="subscribe-btn">Đăng ký</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
