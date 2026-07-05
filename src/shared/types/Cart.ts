import type { Product, ProductVariant } from "./Product";

export type CartItem = {
  id?: string;
  product: Product;
  productId?: string;
  variant?: ProductVariant | null;
  variantId?: string;
  quantity: number;
  unitPrice?: number;
};

export type Cart = {
  id?: string;
  items: CartItem[];
  total?: number;
};

export type AddProductToCartPayload = {
  productId: string;
  variantId?: string;
  quantity?: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};
