export interface ProductVariant {
  id: string;
  name: string;
  optionType?: string;
  price?: number;
  stock?: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  weight: string;
  sellingUnit?: string;
  allowDecimals?: number;
  variants?: ProductVariant[];
  variantsJson?: string;
  price: number;
  rating: number;
  sold: string;
  origin: string;
  seller: string;
  image: string;
  gallery: string[];
  stock?: number;
  description?: string;
}

const productList: Omit<Product, "gallery">[] = [
  {
    id: "1",
    name: "Apple",
    category: "Fruits",
    weight: "1 kg",
    price: 650,
    rating: 4.7,
    sold: "320+",
    origin: "Kullu, HP",
    seller: "Himalaya Farm",
    image: "/src/frontend/assets/images/products/apple.jpg",
  },

  {
    id: "2",
    name: "Honey",
    category: "Honey",
    weight: "1 kg",
    price: 1800,
    rating: 4.8,
    sold: "250+",
    origin: "Mustang, Nepal",
    seller: "Pure Natural",
    image: "/src/frontend/assets/images/products/honey.jpg",
  },

  {
    id: "3",
    name: "Orange",
    category: "Fruits",
    weight: "1 kg",
    price: 650,
    rating: 4.6,
    sold: "280+",
    origin: "Sunsari, Nepal",
    seller: "Fresh Valley",
    image: "/src/frontend/assets/images/products/orange.jpg",
  },

  {
    id: "4",
    name: "Avocado",
    category: "Fruits",
    weight: "1 kg",
    price: 850,
    rating: 4.7,
    sold: "200+",
    origin: "Damak, Nepal",
    seller: "Green Harvest",
    image: "/src/frontend/assets/images/products/avocado.jpg",
  },

  {
    id: "5",
    name: "Banana",
    category: "Fruits",
    weight: "1 kg",
    price: 180,
    rating: 4.5,
    sold: "410+",
    origin: "Chitwan, Nepal",
    seller: "Valley Fresh",
    image: "/src/frontend/assets/images/products/banana.jpg",
  },

  {
    id: "6",
    name: "Tomato",
    category: "Vegetables",
    weight: "1 kg",
    price: 120,
    rating: 4.6,
    sold: "390+",
    origin: "Kavre, Nepal",
    seller: "Hillside Farm",
    image: "/src/frontend/assets/images/products/tomato.jpg",
  },

  {
    id: "7",
    name: "Potato",
    category: "Vegetables",
    weight: "1 kg",
    price: 90,
    rating: 4.4,
    sold: "500+",
    origin: "Palpa, Nepal",
    seller: "Mountain Harvest",
    image: "/src/frontend/assets/images/products/potato.jpg",
  },

  {
    id: "8",
    name: "Spinach",
    category: "Vegetables",
    weight: "500 g",
    price: 80,
    rating: 4.7,
    sold: "260+",
    origin: "Bhaktapur, Nepal",
    seller: "Green Leaf Farm",
    image: "/src/frontend/assets/images/products/spinach.jpg",
  },

  {
    id: "9",
    name: "Turmeric",
    category: "Spices",
    weight: "250 g",
    price: 220,
    rating: 4.8,
    sold: "180+",
    origin: "Ilam, Nepal",
    seller: "Spice Garden",
    image: "/src/frontend/assets/images/products/turmeric.jpg",
  },

  {
    id: "10",
    name: "Chili",
    category: "Spices",
    weight: "200 g",
    price: 160,
    rating: 4.6,
    sold: "210+",
    origin: "Dang, Nepal",
    seller: "Aroma Spices",
    image: "/src/frontend/assets/images/products/chili.jpg",
  },

  {
    id: "11",
    name: "Cumin",
    category: "Spices",
    weight: "200 g",
    price: 190,
    rating: 4.5,
    sold: "150+",
    origin: "Nepalgunj, Nepal",
    seller: "Spice Garden",
    image: "/src/frontend/assets/images/products/cumin.jpg",
  },

  {
    id: "12",
    name: "Milk",
    category: "Dairy & Eggs",
    weight: "1 litre",
    price: 110,
    rating: 4.7,
    sold: "420+",
    origin: "Chitwan, Nepal",
    seller: "Local Dairy",
    image: "/src/frontend/assets/images/products/milk.jpg",
  },

  {
    id: "13",
    name: "Eggs",
    category: "Dairy & Eggs",
    weight: "12 pcs",
    price: 240,
    rating: 4.6,
    sold: "310+",
    origin: "Nuwakot, Nepal",
    seller: "Farm Fresh Dairy",
    image: "/src/frontend/assets/images/products/eggs.jpg",
  },

  {
    id: "14",
    name: "Yogurt",
    category: "Dairy & Eggs",
    weight: "500 g",
    price: 130,
    rating: 4.5,
    sold: "190+",
    origin: "Kathmandu, Nepal",
    seller: "Local Dairy",
    image: "/src/frontend/assets/images/products/yogurt.jpg",
  },

  {
    id: "15",
    name: "Rice",
    category: "Grains",
    weight: "5 kg",
    price: 950,
    rating: 4.8,
    sold: "270+",
    origin: "Jhapa, Nepal",
    seller: "Golden Grain",
    image: "/src/frontend/assets/images/products/rice.jpg",
  },

  {
    id: "16",
    name: "Wheat",
    category: "Grains",
    weight: "5 kg",
    price: 780,
    rating: 4.4,
    sold: "160+",
    origin: "Dang, Nepal",
    seller: "Harvest Mill",
    image: "/src/frontend/assets/images/products/wheat.jpg",
  },

  {
    id: "17",
    name: "Lentils",
    category: "Grains",
    weight: "1 kg",
    price: 280,
    rating: 4.6,
    sold: "230+",
    origin: "Siraha, Nepal",
    seller: "Golden Grain",
    image: "/src/frontend/assets/images/products/lentils.jpg",
  },
];

export const products: Product[] = productList.map((product) => ({
  ...product,
  gallery: [product.image],
}));