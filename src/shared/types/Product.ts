import type { Category } from "./Category";
import type { SubCategory } from "./SubCategory";
import type { UserAddress } from "./UserAddress";

export type ProductMedia = {
  id?: string;
  url?: string;
  path?: string;
  fileUrl?: string;
  imageUrl?: string;
  filename?: string;
  key?: string;
};

export type ProductImage = string | ProductMedia;

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  subCategory?: SubCategory;
  subCategoryId?: string;
  subcategory?: SubCategory;
  subcategoryId?: string;
  images?: ProductImage[];
  productMedia?: ProductImage[];
  media?: ProductImage[];
  isActive: boolean;
  owner?: string;
  pickupAddress?: UserAddress | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
};

export type CreateProductPayload = {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  seller?: string;
  subCategoryId?: string;
  direccionRetiro: string;
  horarioDisponible: string;
  pickupAddressId?: string;
  mediaIds?: string[];
  attributes?: {
    attributeId: string;
    value: string;
  }[];
  owner?: string;
};
