import type { Product } from "./Product";

export type CartItem = {
  id?: string;
  product: Product;
  productId?: string;
  quantity: number;
};

export type Cart = {
  id?: string;
  items: CartItem[];
  total?: number;
};

export type AddProductToCartPayload = {
  productId: string;
  quantity?: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};
