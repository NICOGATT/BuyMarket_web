export type Plan = {
  id: string;
  name: string;
  commissionPercentage: number;
  isActive: boolean;
};

export type CreatePlanPayload = {
  name: string;
  commissionPercentage: number;
  isActive?: boolean;
};

export type UpdatePlanPayload = Partial<CreatePlanPayload>;
