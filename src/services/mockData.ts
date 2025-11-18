export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

export const menu: MenuItem[] = [
  {
    id: 1,
    name: "Cua rang me",
    description: "Cua tươi rang me chua ngọt, thơm ngon đặc biệt",
    price: "450.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Hải sản",
  },
  {
    id: 2,
    name: "Gỏi xoài hải sản",
    description: "Gỏi xoài tươi mát kết hợp hải sản tươi ngon",
    price: "180.000₫",
    image: "/src/services/imgmock/menu/goicatrich.png",
    category: "Salad",
  },
  {
    id: 3,
    name: "Lẩu cá bống mắng chưa",
    description: "Lẩu chua cay đậm đà hương vị miền Tây",
    price: "320.000₫",
    image: "/src/services/imgmock/menu/lauca.png",
    category: "Lẩu",
  },
  {
    id: 4,
    name: "Phở bò",
    description: "Phở bò truyền thống với nước dùng đậm đà",
    price: "40.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Món chính",
  },
  {
    id: 5,
    name: "Bún chả",
    description: "Bún chả Hà Nội với thịt nướng thơm lừng",
    price: "35.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Món chính",
  },
  {
    id: 6,
    name: "Cà phê sữa",
    description: "Cà phê sữa đá truyền thống Việt Nam",
    price: "20.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Đồ uống",
  },
  {
    id: 7,
    name: "Pizza hải sản",
    description: "Pizza với tôm, mực, nghêu tươi ngon",
    price: "280.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Hải sản",
  },
  {
    id: 8,
    name: "Spaghetti bò bằm",
    description: "Mì Ý sốt cà chua với thịt bò băm thơm ngon",
    price: "150.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Món chính",
  },
  {
    id: 9,
    name: "Salad Caesar",
    description: "Salad rau xanh với sốt Caesar đặc trưng",
    price: "120.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Salad",
  },
  {
    id: 10,
    name: "Lẩu Thái chua cay",
    description: "Lẩu Thái với hương vị chua cay đặc trưng",
    price: "380.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Lẩu",
  },
  {
    id: 11,
    name: "Trà sữa truyền thống",
    description: "Trà sữa Việt Nam với hạt trân châu",
    price: "30.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Đồ uống",
  },
  {
    id: 12,
    name: "Tôm rang me",
    description: "Tôm tươi rang me với vị chua ngọt hấp dẫn",
    price: "350.000₫",
    image: "/src/services/imgmock/menu/cuarangme.png",
    category: "Hải sản",
  },
];

// Lấy menu nổi bật (3 món đầu tiên)
export const getFeaturedMenu = (): MenuItem[] => {
  return menu.slice(0, 3);
};

// Lấy tất cả menu
export const getAllMenu = (): MenuItem[] => {
  return menu;
};

// Lấy menu theo danh mục
export const getMenuByCategory = (category: string): MenuItem[] => {
  return menu.filter((item) => item.category === category);
};
