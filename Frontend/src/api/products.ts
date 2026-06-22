import api from "./axios";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateProduct {
  name: string;
  description?: string;
  price: number;
}

export const getProducts = async () => {
  const { data } = await api.get<Product[]>("/products");
  return data;
};

export const getProduct = async (id: number) => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

export const createProduct = async (product: CreateProduct) => {
  const { data } = await api.post<Product>("/products", product);
  return data;
};

export const updateProduct = async (id: number, product: UpdateProduct) => {
  const { data } = await api.put<Product>(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};
