import { api } from "./api";
import type { CreateProductPayload, Product, ProductMedia } from "../types/Product";
import { getUserFromToken } from "../utils/auth";
export async function getProducts() {
    const response = await api.get<Product[]>("/products"); 
    return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const user = getUserFromToken();
  const sellerId = payload.seller ?? payload.owner ?? user?.id ?? user?.sub;
  const subCategoryId = payload.subCategoryId ?? payload.category;
  const requestPayload = {
    title: payload.title,
    description: payload.description,
    price: payload.price,
    stock: payload.stock,
    seller: sellerId,
    subCategoryId,
    mediaIds: payload.mediaIds ?? [],
    attributes: payload.attributes ?? [],
    ...(payload.pickupAddressId
      ? { pickupAddressId: payload.pickupAddressId }
      : {}),
  };

  const response = await api.post<Product>("/products", requestPayload);

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
