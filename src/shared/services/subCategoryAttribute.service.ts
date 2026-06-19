import { api } from "./api";
import type {
  CreateSubCategoryAttributePayload,
  SubCategoryAttribute,
  UpdateSubCategoryAttributePayload,
} from "../types/SubCategoryAttribute";

export async function getSubCategoryAttributes(): Promise<
  SubCategoryAttribute[]
> {
  const response = await api.get<SubCategoryAttribute[]>(
    "/sub-category-attributes"
  );
  return response.data;
}

export async function getSubCategoryAttribute(
  id: string
): Promise<SubCategoryAttribute> {
  const response = await api.get<SubCategoryAttribute>(
    `/sub-category-attributes/${id}`
  );
  return response.data;
}

export async function getSubCategoryAttributesBySubCategory(
  subCategoryId: string
): Promise<SubCategoryAttribute[]> {
  const response = await api.get<SubCategoryAttribute[]>(
    `/sub-category-attributes/subcategory/${subCategoryId}`
  );
  return response.data;
}

export async function createSubCategoryAttribute(
  payload: CreateSubCategoryAttributePayload
): Promise<SubCategoryAttribute> {
  const response = await api.post<SubCategoryAttribute>(
    "/sub-category-attributes",
    payload
  );
  return response.data;
}

export async function updateSubCategoryAttribute(
  id: string,
  payload: UpdateSubCategoryAttributePayload
): Promise<SubCategoryAttribute> {
  const response = await api.patch<SubCategoryAttribute>(
    `/sub-category-attributes/${id}`,
    payload
  );
  return response.data;
}

export async function deleteSubCategoryAttribute(id: string): Promise<void> {
  await api.delete(`/sub-category-attributes/${id}`);
}
