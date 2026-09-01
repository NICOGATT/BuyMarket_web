import type { Product } from "../types/Product";
import { buildImageUrl } from "./buildImageUrl";

export type ProductMediaItem = {
  url: string;
  type: "image" | "video";
};

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

function getMediaType(image: unknown, url: string): "image" | "video" {
  if (typeof image === "object" && image) {
    const explicitType = (image as { type?: string }).type?.toLowerCase();
    if (explicitType === "video") return "video";
  }

  return /\.(mp4|webm|mov|m4v|ogv|ogg)(?:$|[?#])/i.test(url)
    ? "video"
    : "image";
}

export function getProductMediaItems(product: Product): ProductMediaItem[] {
  const media = [
    ...(product.images ?? []),
    ...(product.productMedia ?? []),
    ...(product.media ?? []),
  ];

  const items = media
    .map((item) => {
      const url = buildImageUrl(getImageValue(item));
      return url ? { url, type: getMediaType(item, url) } : null;
    })
    .filter((item): item is ProductMediaItem => Boolean(item));

  return items.filter(
    (item, index) => items.findIndex((candidate) => candidate.url === item.url) === index
  );
}

export function getProductImageUrls(product: Product): string[] {
  return getProductMediaItems(product)
    .filter((item) => item.type === "image")
    .map((item) => item.url);
}

export function getProductFirstImage(product: Product): string | undefined {
  return getProductImageUrls(product)[0];
}
