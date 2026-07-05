import type { CartItem } from "../types/Cart";
import type { OrderItem, Sale } from "../types/Order";
import type { Product, ProductVariant } from "../types/Product";

export function getActiveVariants(product: Product): ProductVariant[] {
  return (product.variants ?? []).filter((variant) => variant.isActive !== false);
}

export function getPurchasableVariants(product: Product): ProductVariant[] {
  return getActiveVariants(product).filter((variant) => Number(variant.stock) > 0);
}

export function hasProductVariants(product: Product): boolean {
  return getActiveVariants(product).length > 0;
}

export function getVariantMinPrice(product: Product): number | null {
  const prices = getActiveVariants(product)
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getVariantTotalStock(product: Product): number | null {
  const variants = getActiveVariants(product);

  if (variants.length === 0) return null;

  return variants.reduce((total, variant) => total + Math.max(0, Number(variant.stock) || 0), 0);
}

export function getDisplayPrice(product: Product): number {
  const basePrice = Number(product.price);

  return getVariantMinPrice(product) ?? (Number.isFinite(basePrice) ? basePrice : 0);
}

export function getCartItemUnitPrice(item: CartItem): number {
  return Number(item.unitPrice ?? item.product.price);
}

export function getOrderItemUnitPrice(item: OrderItem): number {
  return Number(item.unitPrice ?? item.product.price);
}

export function formatVariantLabel(variant?: ProductVariant | null): string {
  if (!variant) return "";

  return [variant.size, variant.color].filter(Boolean).join(" / ");
}

export function getSaleSubtotal(sale: Sale): number {
  const fallbackUnitPrice = Number(sale.unitPrice ?? sale.product?.price ?? 0);

  return Number(sale.subtotal ?? sale.total ?? fallbackUnitPrice * sale.quantity);
}
