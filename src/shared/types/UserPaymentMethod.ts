export type PaymentMethod = "mercado_pago" | "cash" | "transfer";

export type UserPaymentMethod = {
  id: string;
  method: PaymentMethod;
  label: string;
  isDefault: boolean;
  isActive: boolean;
  senderAlias?: string;
  senderCbu?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserPaymentMethodPayload = {
  method: PaymentMethod;
  label: string;
  isDefault?: boolean;
  senderAlias?: string;
  senderCbu?: string;
};

export type UpdateUserPaymentMethodPayload =
  Partial<CreateUserPaymentMethodPayload> & {
    isActive?: boolean;
  };
