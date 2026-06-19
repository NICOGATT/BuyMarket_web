import { api } from "./api";
import type {
  CreateSubCategoryPayload,
  SubCategory,
  UpdateSubCategoryPayload,
} from "../types/SubCategory";

export async function getSubCategories(): Promise<SubCategory[]> {
  const response = await api.get<SubCategory[]>("/subcategories");
  return response.data;
}

export async function getSubCategory(id: string): Promise<SubCategory> {
  const response = await api.get<SubCategory>(`/subcategories/${id}`);
  return response.data;
}

export async function getSubCategoriesByCategory(
  categoryId: string
): Promise<SubCategory[]> {
  const response = await api.get<SubCategory[]>(
    `/subcategories/category/${categoryId}`
  );
  return response.data;
}

export async function createSubCategory(
  payload: CreateSubCategoryPayload
): Promise<SubCategory> {
  const response = await api.post<SubCategory>("/subcategories", payload);
  return response.data;
}

export async function updateSubCategory(
  id: string,
  payload: UpdateSubCategoryPayload
): Promise<SubCategory> {
  const response = await api.patch<SubCategory>(`/subcategories/${id}`, payload);
  return response.data;
}

export async function deleteSubCategory(id: string): Promise<void> {
  await api.delete(`/subcategories/${id}`);
}
