import type { Category, CategoryImage } from "../types/Category";
import { buildImageUrl } from "./buildImageUrl";

function addUniqueUrl(urls: string[], url: string | null) {
  if (url && !urls.includes(url)) {
    urls.push(url);
  }
}

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

function getImageUrlCandidates(image: CategoryImage | undefined): string[] {
  const value = getImageValue(image);
  const urls: string[] = [];

  if (!value) return urls;

  addUniqueUrl(urls, buildImageUrl(value));

  if (value.startsWith("http")) {
    addUniqueUrl(urls, value);
  }

  return urls;
}

function buildCategoryImageUrls(...images: Array<CategoryImage | undefined>) {
  const urls: string[] = [];

  for (const image of images) {
    getImageUrlCandidates(image).forEach((imageUrl) =>
      addUniqueUrl(urls, imageUrl)
    );
  }

  return urls;
}

function getFirstUrl(urls: string[]) {
  return urls[0] ?? null;
}

export function getCategoryIconUrls(category: Category): string[] {
  return buildCategoryImageUrls(
    category.icon,
    category.iconUrl,
    category.iconPath,
    category.imageUrl,
    category.url,
    category.path
  );
}

export function getCategoryBannerUrls(category: Category): string[] {
  return buildCategoryImageUrls(
    category.banner,
    category.bannerUrl,
    category.bannerPath
  );
}

export function getCategoryDisplayImageUrls(category: Category): string[] {
  return buildCategoryImageUrls(
    category.icon,
    category.iconUrl,
    category.iconPath,
    category.imageUrl,
    category.url,
    category.path,
    category.banner,
    category.bannerUrl,
    category.bannerPath
  );
}

export function getCategoryIconUrl(category: Category): string | null {
  return getFirstUrl(getCategoryIconUrls(category));
}

export function getCategoryBannerUrl(category: Category): string | null {
  return getFirstUrl(getCategoryBannerUrls(category));
}

export function getCategoryDisplayImageUrl(category: Category): string | null {
  return getFirstUrl(getCategoryDisplayImageUrls(category));
}

export function getCategoryInitials(category: Category): string {
  return category.name.trim().slice(0, 2).toUpperCase() || "BM";
}
