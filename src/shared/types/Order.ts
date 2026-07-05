import type { Product, ProductVariant } from "./Product";
import type { Shipment } from "./Shipment";
import type { User } from "./User";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "on_the_way"
  | "paid"
  | "delivered"
  | "cancelled"
  | "rejected"
  | "review";

export type OrderItem = {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
  unitPrice?: number;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "REJECTED";

export type OrderPayment = {
  id: string;
  status: PaymentStatus;
  method?: string;
  amount?: number;
  senderAlias?: string;
  senderCbu?: string;
  proofUrl?: string;
  proofImageUrl?: string;
  proofFileUrl?: string;
  transferProofUrl?: string;
  receiptUrl?: string;
  proof?: {
    url?: string;
    fileUrl?: string;
    imageUrl?: string;
  } | null;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Order = {
  id: string;
  buyer?: User;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  payment?: OrderPayment;
  deliveryAddress?: string;
  shipment?: Shipment | null;
  shipments?: Shipment[];
  notes?: string;
  createdAt?: string;
};

export type Sale = {
  id: string;
  orderId?: string;
  product?: Product;
  productId?: string;
  buyer?: User;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
  total?: number;
  status?: OrderStatus | string;
  variant?: ProductVariant | null;
  createdAt?: string;
};
