import { api } from "./api";
import type {
  CreateProductPayload,
  Product,
  ProductMedia,
  ProductVariantPayload,
  UpdateProductPayload,
} from "../types/Product";
import { getUserFromToken } from "../utils/auth";

function getActiveVariantStats(variants?: ProductVariantPayload[]) {
  const activeVariants = (variants ?? []).filter(
    (variant) => variant.isActive !== false
  );

  if (activeVariants.length === 0) return null;

  return {
    price: Math.min(...activeVariants.map((variant) => Number(variant.price))),
    stock: activeVariants.reduce(
      (total, variant) => total + Math.max(0, Number(variant.stock) || 0),
      0
    ),
  };
}

function buildProductRequestPayload(
  payload: CreateProductPayload | UpdateProductPayload,
  includeDefaultSeller = false
) {
  const user = getUserFromToken();
  const sellerId =
    payload.seller ??
    payload.owner ??
    (includeDefaultSeller ? user?.id ?? user?.sub : undefined);
  const subCategoryId = payload.subCategoryId ?? payload.category;
  const variantStats = getActiveVariantStats(payload.variants);
  const requestPayload: Record<string, unknown> = {};

  if (payload.title !== undefined) requestPayload.title = payload.title;
  if (payload.description !== undefined) {
    requestPayload.description = payload.description;
  }
  if (variantStats?.price !== undefined || payload.price !== undefined) {
    requestPayload.price = variantStats?.price ?? payload.price;
  }
  if (variantStats?.stock !== undefined || payload.stock !== undefined) {
    requestPayload.stock = variantStats?.stock ?? payload.stock;
  }
  if (sellerId) requestPayload.seller = sellerId;
  if (subCategoryId) requestPayload.subCategoryId = subCategoryId;
  if (payload.mediaIds !== undefined) requestPayload.mediaIds = payload.mediaIds;
  if (payload.attributes !== undefined) {
    requestPayload.attributes = payload.attributes;
  }
  if (payload.horarioDisponible !== undefined) {
    requestPayload.horarioDisponible = payload.horarioDisponible;
  }
  if (payload.pickupAddressId) {
    requestPayload.pickupAddressId = payload.pickupAddressId;
  }
  if (payload.variants !== undefined) requestPayload.variants = payload.variants;

  return requestPayload;
}

export async function getProducts() {
  const response = await api.get<Product[]>("/products");
  return response.data;
}

export async function getAdminProducts() {
  const response = await api.get<Product[]>("/products/admin");
  return response.data;
}

export async function getFeaturedProducts() {
  const response = await api.get<Product[]>("/products/featured");
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
}

export async function getMyProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/products/my-products");

  return response.data;
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const requestPayload = buildProductRequestPayload(payload, true);

  const response = await api.post<Product>("/products", requestPayload);

  return response.data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<Product> {
  const requestPayload = buildProductRequestPayload(payload);
  const response = await api.patch<Product>(`/products/${id}`, requestPayload);

  return response.data;
}

export async function uploadProductMedia(
  productId: string,
  files: File[]
): Promise<void> {
  const formData = new FormData();

  formData.append("productId", productId);
  files.forEach((file) => {
    formData.append("files", file);
  });

  await api.post("/product-media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function uploadProductMediaFiles(
  files: File[]
): Promise<ProductMedia[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<ProductMedia[]>(
    "/product-media/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function approveProduct(id: string): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}/approve`);
  return response.data;
}

export async function rejectProduct(id: string): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}/reject`);
  return response.data;
}
