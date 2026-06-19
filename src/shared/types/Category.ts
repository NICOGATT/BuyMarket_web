export type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  banner?: string; 
};

export type CreateCategoryPayload = {
  name: string;
  description?: string;
};