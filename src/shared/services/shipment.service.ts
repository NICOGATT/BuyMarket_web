import axios from "axios";
import { api } from "./api";
import type { CreateShipmentPayload, Shipment } from "../types/Shipment";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return fallback;
}

export async function getShipments(): Promise<Shipment[]> {
  const response = await api.get<Shipment[]>("/shipments");

  return response.data;
}

export async function createShipment(
  payload: CreateShipmentPayload
): Promise<Shipment> {
  try {
    const response = await api.post<Shipment>("/shipments", payload);

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo crear el envio."));
  }
}

export async function assignShipmentDriver(
  id: string,
  driverId: string
): Promise<Shipment> {
  try {
    const response = await api.patch<Shipment>(
      `/shipments/${id}/assign-driver`,
      { driverId }
    );

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo asignar el repartidor."));
  }
}

export async function markPickedUp(id: string): Promise<Shipment> {
  const response = await api.patch<Shipment>(`/shipments/${id}/picked-up`);

  return response.data;
}

export async function markInTransit(id: string): Promise<Shipment> {
  const response = await api.patch<Shipment>(`/shipments/${id}/in-transit`);

  return response.data;
}

export async function markDelivered(id: string): Promise<Shipment> {
  const response = await api.patch<Shipment>(`/shipments/${id}/delivered`);

  return response.data;
}

export async function cancelShipment(id: string): Promise<Shipment> {
  const response = await api.patch<Shipment>(`/shipments/${id}/cancel`);

  return response.data;
}

export async function updateTracking(
  id: string,
  trackingCode: string
): Promise<Shipment> {
  try {
    const response = await api.patch<Shipment>(`/shipments/${id}/tracking`, {
      trackingCode,
    });

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo actualizar el tracking."));
  }
}
