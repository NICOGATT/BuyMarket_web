import { api } from "./api";
import type { Category, CreateCategoryPayload } from "../types/Category";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<Category> {
  const response = await api.post<Category>("/categories", payload);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function uploadCategoryImages(
    categoryId: string,
    icon?: File | null,
    banner?: File | null
) {
    const formData = new FormData();

    if(icon) {
        formData.append("icon", icon); 
    }

    if(banner) {
        formData.append("banner", banner); 
    }
    const response = await api.post(
        `/categories/${categoryId}/images`,
        formData,
        {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        }
    );

    return response.data;
}
