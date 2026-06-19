import type { Category } from "./Category";

export type SubCategory = {
  id: string;
  name: string;
  categoryId: string;
  category?: Category;
};

export type CreateSubCategoryPayload = {
  name: string;
  categoryId: string;
};

export type UpdateSubCategoryPayload = Partial<CreateSubCategoryPayload>;
