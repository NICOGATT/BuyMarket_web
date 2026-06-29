import type { Product } from "../types/Product";

export function getProductCategoryId(product: Product) {
  if (typeof product.category === "string") return product.category;

  return (
    product.category?.id ??
    product.subCategory?.category?.id ??
    product.subCategory?.categoryId ??
    product.subcategory?.category?.id ??
    product.subcategory?.categoryId ??
    ""
  );
}

export function getProductCategoryName(product: Product) {
  if (typeof product.category === "string") return product.category;

  return (
    product.category?.name ??
    product.subCategory?.category?.name ??
    product.subcategory?.category?.name ??
    product.subCategory?.name ??
    product.subcategory?.name
  );
}
