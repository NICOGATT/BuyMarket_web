import { api } from "./api";
import type { Color, ColorPayload } from "../types/Color";

export async function getColors(): Promise<Color[]> {
  const response = await api.get<Color[]>("/colors");

  return response.data;
}

export async function createColor(payload: ColorPayload): Promise<Color> {
  const response = await api.post<Color>("/colors", payload);

  return response.data;
}

export async function updateColor(
  id: string,
  payload: ColorPayload
): Promise<Color> {
  const response = await api.patch<Color>(`/colors/${id}`, payload);

  return response.data;
}

export async function deleteColor(id: string): Promise<void> {
  await api.delete(`/colors/${id}`);
}
