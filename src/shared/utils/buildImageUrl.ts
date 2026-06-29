import { API_URL } from "../services/api";

export function buildImageUrl(image?: string | null): string | null {
  if (!image || image.trim() === "") return null
  
  if (image.startsWith("http://localhost:3000")) {
    return image.replace("http://localhost:3000", API_URL);
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? image : `/${image}`}`;
}