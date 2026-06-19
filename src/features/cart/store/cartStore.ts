import { api } from "../../../shared/services/api";
import axios from "axios";
import { getUserFromToken, logout } from "../../../shared/utils/auth";
import type {
  AddProductToCartPayload,
  Cart,
  CartItem,
  UpdateCartItemPayload,
} from "../../../shared/types/Cart";
import type { Product } from "../../../shared/types/Product";

export const CART_CHANGE_EVENT = "cart-change";
const AUTH_REQUIRED_ERROR = "AUTH_REQUIRED";

function emitCartChange() {
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

function getCartItems(cart: Cart | CartItem[]): CartItem[] {
  return Array.isArray(cart) ? cart : cart.items;
}

function ensureAuthenticated() {
  if (!getUserFromToken()) {
    throw new Error(AUTH_REQUIRED_ERROR);
  }
}

export function isAuthRequiredError(error: unknown) {
  return error instanceof Error && error.message === AUTH_REQUIRED_ERROR;
}

function handleCartRequestError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    logout();
    throw new Error(AUTH_REQUIRED_ERROR);
  }

  throw error;
}

export async function getCart(): Promise<CartItem[]> {
  if (!getUserFromToken()) {
    return [];
  }

  try {
    const response = await api.get<Cart | CartItem[]>("/carts/my-cart");
    return getCartItems(response.data);
  } catch (error) {
    handleCartRequestError(error);
  }
}

export async function addProductToCart(
  payload: AddProductToCartPayload
): Promise<CartItem[]> {
  ensureAuthenticated();

  try {
    const response = await api.post<Cart | CartItem[]>(
      "/carts/add-product",
      payload
    );

    emitCartChange();
    return getCartItems(response.data);
  } catch (error) {
    handleCartRequestError(error);
  }
}

export async function addCart(product: Product): Promise<CartItem[]> {
  return addProductToCart({
    productId: product.id,
    quantity: 1,
  });
}

export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload
): Promise<CartItem[]> {
  ensureAuthenticated();

  try {
    const response = await api.patch<Cart | CartItem[]>(
      `/carts/items/${itemId}`,
      payload
    );

    emitCartChange();
    return getCartItems(response.data);
  } catch (error) {
    handleCartRequestError(error);
  }
}

export async function removeCartItem(itemId: string): Promise<void> {
  ensureAuthenticated();

  try {
    await api.delete(`/carts/items/${itemId}`);
    emitCartChange();
  } catch (error) {
    handleCartRequestError(error);
  }
}

export async function clearCart(): Promise<void> {
  ensureAuthenticated();

  try {
    await api.delete("/carts/clear");
    emitCartChange();
  } catch (error) {
    handleCartRequestError(error);
  }
}
