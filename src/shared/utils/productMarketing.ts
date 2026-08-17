import type { Product } from "../types/Product";

function normalizeMarketingText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getProductAttributeEntries(product: Product) {
  const entries: Array<[string, string]> = [];
  const attributes = [
    ...(product.attributes ?? []),
    ...(product.attributeValues ?? []),
    ...(product.productAttributes ?? []),
    ...(product.productAttributeValues ?? []),
    ...(product.variants ?? []).flatMap((variant) => variant.attributes ?? []),
  ];

  for (const attribute of attributes) {
    const name =
      attribute.attribute?.name ??
      attribute.subCategoryAttribute?.name ??
      attribute.name ??
      "";
    const value = attribute.value ?? "";

    if (name && value) entries.push([name, value]);
  }

  return entries;
}

export function productMatchesBrand(product: Product, brand: string) {
  const normalizedBrand = normalizeMarketingText(brand);
  if (!normalizedBrand) return true;

  const productRecord = product as unknown as Record<string, unknown>;
  const directBrand = productRecord.brand;

  if (typeof directBrand === "string") {
    if (normalizeMarketingText(directBrand) === normalizedBrand) return true;
  } else if (directBrand && typeof directBrand === "object") {
    const brandRecord = directBrand as Record<string, unknown>;
    if (
      normalizeMarketingText(brandRecord.name ?? brandRecord.title) ===
      normalizedBrand
    ) {
      return true;
    }
  }

  for (const [name, value] of getProductAttributeEntries(product)) {
    if (
      normalizeMarketingText(name) === "marca" &&
      normalizeMarketingText(value) === normalizedBrand
    ) {
      return true;
    }
  }

  const seller =
    product.seller ??
    product.owner ??
    product.user ??
    product.createdBy ??
    product.publishedBy;

  if (seller) {
    const sellerText =
      typeof seller === "string"
        ? seller
        : `${seller.name ?? ""} ${seller.firstName ?? ""} ${
            seller.lastName ?? ""
          } ${seller.email ?? ""}`;

    if (normalizeMarketingText(sellerText).includes(normalizedBrand)) {
      return true;
    }
  }

  return normalizeMarketingText(`${product.title} ${product.description}`).includes(
    normalizedBrand
  );
}

function isPositiveNumber(value: unknown) {
  if (typeof value === "string" && value.trim() === "") return false;
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function isCurrentlyActive(record: Record<string, unknown>) {
  for (const key of ["isActive", "active", "enabled", "isEnabled"]) {
    if (record[key] === false) return false;
  }

  const now = Date.now();
  const startValue = record.startsAt ?? record.startDate ?? record.validFrom;
  const endValue = record.endsAt ?? record.endDate ?? record.validUntil;
  const start = startValue ? Date.parse(String(startValue)) : Number.NaN;
  const end = endValue ? Date.parse(String(endValue)) : Number.NaN;

  if (Number.isFinite(start) && start > now) return false;
  if (Number.isFinite(end) && end < now) return false;
  return true;
}

function hasActivePromotionValue(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasActivePromotionValue);
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  if (!isCurrentlyActive(record)) return false;

  const discountKeys = [
    "discount",
    "discountAmount",
    "discountPercentage",
    "discountPercent",
    "percentage",
    "amount",
    "value",
  ];

  if (discountKeys.some((key) => isPositiveNumber(record[key]))) return true;

  return ["code", "couponCode", "promoCode"].some(
    (key) => typeof record[key] === "string" && record[key].trim().length > 0
  );
}

export function hasProductOffer(product: Product) {
  const record = product as unknown as Record<string, unknown>;

  if (
    ["hasDiscount", "isDiscounted", "onSale", "isOnSale"].some(
      (key) => record[key] === true
    )
  ) {
    return true;
  }

  const discountKeys = [
    "discount",
    "discountAmount",
    "discountPercentage",
    "discountPercent",
  ];
  if (discountKeys.some((key) => isPositiveNumber(record[key]))) return true;

  const currentPrice = Number(
    record.salePrice ?? record.promotionalPrice ?? product.price
  );
  const originalPrice = Number(record.originalPrice ?? record.listPrice);
  if (
    Number.isFinite(currentPrice) &&
    Number.isFinite(originalPrice) &&
    originalPrice > currentPrice
  ) {
    return true;
  }

  const promotionKeys = [
    "coupon",
    "coupons",
    "activeCoupon",
    "activeCoupons",
    "promotion",
    "promotions",
    "activePromotion",
    "activePromotions",
  ];
  if (promotionKeys.some((key) => hasActivePromotionValue(record[key]))) {
    return true;
  }

  return getProductAttributeEntries(product).some(([name, value]) => {
    const normalizedName = normalizeMarketingText(name);
    const isOfferAttribute = ["descuento", "cupon", "promocion", "oferta"].some(
      (term) => normalizedName.includes(term)
    );

    return isOfferAttribute && normalizeMarketingText(value) !== "no" && value !== "0";
  });
}
