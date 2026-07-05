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
  payload: CreateProductPayload | UpdateProductPayload
) {
  const user = getUserFromToken();
  const sellerId = payload.seller ?? payload.owner ?? user?.id ?? user?.sub;
  const subCategoryId = payload.subCategoryId ?? payload.category;
  const variantStats = getActiveVariantStats(payload.variants);

  return {
    title: payload.title,
    description: payload.description,
    price: variantStats?.price ?? payload.price,
    stock: variantStats?.stock ?? payload.stock,
    seller: sellerId,
    subCategoryId,
    mediaIds: payload.mediaIds ?? [],
    attributes: payload.attributes ?? [],
    horarioDisponible: payload.horarioDisponible,
    ...(payload.pickupAddressId
      ? { pickupAddressId: payload.pickupAddressId }
      : {}),
    ...(payload.variants !== undefined ? { variants: payload.variants } : {}),
  };
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
  const requestPayload = buildProductRequestPayload(payload);

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
