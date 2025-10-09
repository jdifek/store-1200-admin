export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  createdAt: string;
  categoryId: string;
  category?: Category;
}

export interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string | null;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  chatId: string;
  fromAdmin: boolean;
}

export interface Review {
  id: string;
  content: string;
  rating: number;
  avatar: string;
  author: string | null;
  createdAt: string;
}

export interface Stats {
  categories: number;
  products: number;
  chats: number;
  reviews: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface CategoryFormData {
  name: string;
  parentId: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
}

export interface ReviewFormData {
  content: string;
  rating: string;
  author: string;
  avatar: string;
}