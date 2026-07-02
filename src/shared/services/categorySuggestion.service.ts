import { api } from "./api";
import type { Category } from "../types/Category";
import type { CategorySuggestion } from "../types/CategorySuggestion";

type ApproveCategorySuggestionResponse = {
  message?: string;
  category: Category;
};

type RejectCategorySuggestionResponse = {
  message?: string;
};

export type CreateCategorySuggestionPayload = {
  name: string;
  description?: string;
};

export async function createCategorySuggestion(
  payload: CreateCategorySuggestionPayload
): Promise<CategorySuggestion> {
  const response = await api.post<CategorySuggestion>(
    "/category-suggestions",
    payload
  );

  return response.data;
}

export async function getPendingCategorySuggestions(): Promise<
  CategorySuggestion[]
> {
  const response = await api.get<CategorySuggestion[]>(
    "/category-suggestions/pending"
  );

  return response.data;
}

export async function approveCategorySuggestion(
  id: string
): Promise<ApproveCategorySuggestionResponse> {
  const response = await api.patch<ApproveCategorySuggestionResponse>(
    `/category-suggestions/${id}/approve`
  );

  return response.data;
}

export async function rejectCategorySuggestion(
  id: string
): Promise<RejectCategorySuggestionResponse> {
  const response = await api.patch<RejectCategorySuggestionResponse>(
    `/category-suggestions/${id}/reject`
  );

  return response.data;
}
