import type { Category } from "./Category";
import type { SubCategory } from "./SubCategory";
import type { SubCategoryAttribute } from "./SubCategoryAttribute";
import type { User } from "./User";
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

export type ProductAttributeValue = {
  id?: string;
  name?: string;
  value?: string;
  attribute?: SubCategoryAttribute;
  subCategoryAttribute?: SubCategoryAttribute;
};

export type ProductPublisher = string | User;
export type ProductApprovalStatus = "pending" | "approved" | "rejected";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category?: Category | string;
  subCategory?: SubCategory;
  subCategoryId?: string;
  subcategory?: SubCategory;
  subcategoryId?: string;
  images?: ProductImage[];
  productMedia?: ProductImage[];
  media?: ProductImage[];
  isActive: boolean;
  approvalStatus?: ProductApprovalStatus;
  owner?: ProductPublisher;
  ownerId?: string;
  seller?: ProductPublisher;
  sellerId?: string;
  user?: ProductPublisher;
  userId?: string;
  createdBy?: ProductPublisher;
  createdById?: string;
  publishedBy?: ProductPublisher;
  publishedById?: string;
  direccionRetiro?: string;
  horarioDisponible?: string;
  pickupAddress?: UserAddress | null;
  attributes?: ProductAttributeValue[];
  attributeValues?: ProductAttributeValue[];
  productAttributes?: ProductAttributeValue[];
  productAttributeValues?: ProductAttributeValue[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  categoryName?: string;
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
