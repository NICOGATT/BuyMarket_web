import type { User } from "./User";

export type CategorySuggestionStatus = "pending" | "approved" | "rejected";

export type CategorySuggestion = {
  id: string;
  name: string;
  description?: string;
  status: CategorySuggestionStatus;
  user?: User;
  createdAt?: string;
};
