import { api } from "./api";
import type { Color } from "../types/Color";

export async function getColors(): Promise<Color[]> {
  const response = await api.get<Color[]>("/colors");

  return response.data;
}
