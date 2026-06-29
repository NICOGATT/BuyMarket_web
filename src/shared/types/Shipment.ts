import type { Order } from "./Order";
import type { User } from "./User";

export type ShipmentStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type ShipmentType = "local_delivery" | "national_shipping";

export type ShipmentCarrier =
  | "buymarket"
  | "andreani"
  | "correo_argentino"
  | "oca";

export type Shipment = {
  id: string;
  order?: Order;
  orderId?: string;
  buyer?: User;
  seller?: User;
  driver?: User;
  driverId?: string;
  type?: ShipmentType | string;
  carrier?: ShipmentCarrier | string;
  status?: ShipmentStatus | string;
  deliveryAddress?: string;
  pickupAddress?: string;
  receiverName?: string;
  phone?: string;
  trackingCode?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateShipmentPayload = {
  orderId: string;
  type: ShipmentType;
  carrier: ShipmentCarrier;
  deliveryAddress: string;
  notes?: string;
};
