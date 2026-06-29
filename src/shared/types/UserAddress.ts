export type UserAddress = {
  id: string;
  label: string;
  receiverName?: string;
  phone: string;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  reference?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserAddressPayload = {
  label: string;
  receiverName?: string;
  phone: string;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  reference?: string;
  isDefault?: boolean;
};

export type UpdateUserAddressPayload = Partial<CreateUserAddressPayload>;
