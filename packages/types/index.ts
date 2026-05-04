// Example
export interface Product {
  id: string;
  name: string;
  price: number;
  sellerId: string;
}

export interface User {
  id: string;
  email: string;
  role: "buyer" | "seller" | "admin";
}