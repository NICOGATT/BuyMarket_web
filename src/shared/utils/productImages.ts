import type { Product } from "../types/Product";
import { buildImageUrl } from "./buildImageUrl";

function getImageValue(image: unknown): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (typeof image !== "object") return null;

  const media = image as {
    url?: string;
    path?: string;
    fileUrl?: string;
    imageUrl?: string;
    filename?: string;
    key?: string;
  };

  return (
    media.url ??
    media.path ??
    media.fileUrl ??
    media.imageUrl ??
    media.filename ??
    media.key ??
    null
  );
}

export function getProductImageUrls(product: Product): string[] {
  const images = [
    ...(product.images ?? []),
    ...(product.productMedia ?? []),
    ...(product.media ?? []),
  ];

  return images
    .map((image) => buildImageUrl(getImageValue(image)))
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
}

export function getProductFirstImage(product: Product): string | undefined {
  return getProductImageUrls(product)[0];
}
