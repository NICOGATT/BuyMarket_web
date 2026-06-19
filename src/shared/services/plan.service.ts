import { api } from "./api";
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from "../types/Plan";

export async function getPlans(): Promise<Plan[]> {
  const response = await api.get<Plan[]>("/plans");
  return response.data;
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  const response = await api.post<Plan>("/plans", payload);
  return response.data;
}

export async function updatePlan(
  id: string,
  payload: UpdatePlanPayload
): Promise<Plan> {
  const response = await api.patch<Plan>(`/plans/${id}`, payload);
  return response.data;
}
