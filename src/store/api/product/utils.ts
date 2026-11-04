export interface Product {
  id: string;
  name: string;
  category: string;
  weight: string;
  price: number;
  rating: number;
  sold: string;
  origin: string;
  seller: string;
  image: string;
  stock?: number;
  active?: number;
  description?: string;
}
