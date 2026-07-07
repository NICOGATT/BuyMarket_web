import type { SubCategory } from "./SubCategory";

export const subCategoryAttributeTypes = [
  "text",
  "number",
  "select",
  "boolean",
] as const;

export type SubCategoryAttributeType =
  (typeof subCategoryAttributeTypes)[number];

export const subCategoryAttributeUsages = [
  "product_attribute",
  "variant_size",
  "variant_color",
  "variant_measure",
] as const;

export type SubCategoryAttributeUsage =
  (typeof subCategoryAttributeUsages)[number];

export type SubCategoryAttributeAppliesTo = "PRODUCT" | "VARIANT";

export type SubCategoryAttribute = {
  id: string;
  name: string;
  type: SubCategoryAttributeType;
  required: boolean;
  appliesTo?: SubCategoryAttributeAppliesTo;
  usage?: SubCategoryAttributeUsage;
  options?: string[];
  subCategoryId: string;
  subCategory?: SubCategory;
};

export type CreateSubCategoryAttributePayload = {
  name: string;
  type: SubCategoryAttributeType;
  required: boolean;
  appliesTo?: SubCategoryAttributeAppliesTo;
  usage?: SubCategoryAttributeUsage;
  options?: string[];
  subCategoryId: string;
};

export type UpdateSubCategoryAttributePayload =
  Partial<CreateSubCategoryAttributePayload>;
