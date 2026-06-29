import { useEffect, useMemo, useState } from "react";
import { getAdminOrders } from "../../shared/services/order.service";
import {
  assignShipmentDriver,
  cancelShipment,
  createShipment,
  getShipments,
  markDelivered,
  markInTransit,
  markPickedUp,
  updateTracking,
} from "../../shared/services/shipment.service";
import type { Order } from "../../shared/types/Order";
import type {
  CreateShipmentPayload,
  ShipmentCarrier,
  Shipment,
  ShipmentType,
} from "../../shared/types/Shipment";

type CreateShipmentForm = {
  orderId: string;
  type: ShipmentType;
  carrier: ShipmentCarrier;
  deliveryAddress: string;
  phone: string;
  receiverName: string;
  notes: string;
};

const emptyCreateShipmentForm: CreateShipmentForm = {
  orderId: "",
  type: "local_delivery",
  carrier: "buymarket",
  deliveryAddress: "",
  phone: "",
  receiverName: "",
  notes: "",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  assigned: "Asignado",
  picked_up: "Retirado",
  in_transit: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const typeLabels: Record<string, string> = {
  local_delivery: "Local",
  national_shipping: "Nacional",
};

const carrierLabels: Record<string, string> = {
  buymarket: "BuyMarket",
  andreani: "Andreani",
  correo_argentino: "Correo Argentino",
  oca: "OCA",
};

function getShipmentOrderId(shipment: Shipment) {
  return shipment.orderId ?? shipment.order?.id ?? "";
}

function getOrderLabel(order: Order) {
  return `#${order.id.slice(0, 8)} - ${
    order.buyer?.email ?? "Sin comprador"
  } - $${Number(order.total).toLocaleString("es-AR")}`;
}

function isOrderShippable(order: Order) {
  const paymentStatus = order.payment?.status ?? order.paymentStatus;

  return (
    order.status === "paid" ||
    order.status === "accepted" ||
    order.status === "preparing" ||
    paymentStatus === "COMPLETED"
  );
}

function buildContactNotes(phone: string, receiverName: string, notes: string) {
  return [
    `Telefono: ${phone}`,
    receiverName ? `Recibe: ${receiverName}` : "",
    notes || "",
  ]
    .filter(Boolean)
    .join(". ");
}

function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [createForm, setCreateForm] = useState<CreateShipmentForm>(
    emptyCreateShipmentForm
  );
  const [driverInputs, setDriverInputs] = useState<Record<string, string>>({});
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [workingShipmentId, setWorkingShipmentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const shipmentOrderIds = useMemo(
    () => new Set(shipments.map(getShipmentOrderId).filter(Boolean)),
    [shipments]
  );

  const ordersWithoutShipment = useMemo(
    () =>
      orders.filter(
        (order) =>
          isOrderShippable(order) &&
          !order.shipment &&
          !(order.shipments?.length ?? 0) &&
          !shipmentOrderIds.has(order.id)
      ),
    [orders, shipmentOrderIds]
  );

  async function loadAdminShipments() {
    try {
      setError("");
      const [shipmentsData, ordersData] = await Promise.all([
        getShipments(),
        getAdminOrders(),
      ]);

      setShipments(shipmentsData);
      setOrders(ordersData);
    } catch {
      setError("No se pudieron cargar los envios.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminShipments();
  }, []);

  function handleCreateFormChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    if (name === "orderId") {
      const selectedOrder = orders.find((order) => order.id === value);

      setCreateForm((prev) => ({
        ...prev,
        orderId: value,
        deliveryAddress: selectedOrder?.deliveryAddress ?? "",
      }));
      return;
    }

    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleCreateShipment(event: React.FormEvent) {
    event.preventDefault();

    const payload: CreateShipmentPayload = {
      orderId: createForm.orderId,
      type: createForm.type,
      carrier: createForm.carrier,
      deliveryAddress: createForm.deliveryAddress.trim(),
      notes: buildContactNotes(
        createForm.phone.trim(),
        createForm.receiverName.trim(),
        createForm.notes.trim()
      ),
    };

    if (!payload.orderId || !payload.deliveryAddress || !createForm.phone.trim()) {
      setError("Selecciona una orden, destino y telefono para crear el envio.");
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      const shipment = await createShipment(payload);
      setShipments((prev) => [shipment, ...prev]);
      setCreateForm(emptyCreateShipmentForm);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear el envio."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function runShipmentAction(
    shipmentId: string,
    action: () => Promise<Shipment>,
    fallback: string
  ) {
    try {
      setWorkingShipmentId(shipmentId);
      setError("");
      const updatedShipment = await action();

      setShipments((prev) =>
        prev.map((shipment) =>
          shipment.id === shipmentId ? updatedShipment : shipment
        )
      );
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : fallback);
    } finally {
      setWorkingShipmentId(null);
    }
  }

  async function handleAssignDriver(shipment: Shipment) {
    const driverId = driverInputs[shipment.id]?.trim();

    if (!driverId) {
      setError("Ingresa el ID del repartidor.");
      return;
    }

    await runShipmentAction(
      shipment.id,
      () => assignShipmentDriver(shipment.id, driverId),
      "No se pudo asignar el repartidor."
    );
  }

  async function handleUpdateTracking(shipment: Shipment) {
    const trackingCode = trackingInputs[shipment.id]?.trim();

    if (!trackingCode) {
      setError("Ingresa un codigo de tracking.");
      return;
    }

    await runShipmentAction(
      shipment.id,
      () => updateTracking(shipment.id, trackingCode),
      "No se pudo actualizar el tracking."
    );
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando envios...</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-950">Envios</h1>
        <p className="mt-2 text-slate-500">
          Crea envios desde ordenes pagadas y opera la asignacion a repartidores.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
          {error}
        </p>
      )}

      <form
        onSubmit={handleCreateShipment}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="m-0 text-2xl font-black text-slate-950">
          Crear envio
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="mb-2 block font-bold text-slate-700">Orden</span>
            <select
              name="orderId"
              value={createForm.orderId}
              onChange={handleCreateFormChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600"
            >
              <option value="">
                {ordersWithoutShipment.length === 0
                  ? "No hay ordenes listas para envio"
                  : "Seleccionar orden"}
              </option>
              {ordersWithoutShipment.map((order) => (
                <option key={order.id} value={order.id}>
                  {getOrderLabel(order)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">Tipo</span>
            <select
              name="type"
              value={createForm.type}
              onChange={handleCreateFormChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600"
            >
              <option value="local_delivery">Local</option>
              <option value="national_shipping">Nacional</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Transportista
            </span>
            <select
              name="carrier"
              value={createForm.carrier}
              onChange={handleCreateFormChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600"
            >
              <option value="buymarket">BuyMarket</option>
              <option value="andreani">Andreani</option>
              <option value="correo_argentino">Correo Argentino</option>
              <option value="oca">OCA</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">Telefono</span>
            <input
              name="phone"
              value={createForm.phone}
              onChange={handleCreateFormChange}
              placeholder="Telefono de contacto"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Nombre de quien recibe
            </span>
            <input
              name="receiverName"
              value={createForm.receiverName}
              onChange={handleCreateFormChange}
              placeholder="Opcional"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">Notas</span>
            <input
              name="notes"
              value={createForm.notes}
              onChange={handleCreateFormChange}
              placeholder="Notas internas"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block font-bold text-slate-700">
              Direccion de entrega
            </span>
            <textarea
              name="deliveryAddress"
              value={createForm.deliveryAddress}
              onChange={handleCreateFormChange}
              placeholder="Destino del envio"
              className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
        </div>

        <button
          disabled={isCreating}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isCreating ? "Creando..." : "Crear envio"}
        </button>
      </form>

      {shipments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-900">
            No hay envios todavia
          </h2>
          <p className="mt-2 text-slate-500">
            Cuando crees envios desde ordenes, apareceran aca.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-5 py-4">Orden</th>
                <th className="px-5 py-4">Comprador</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Transportista</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Destino</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Repartidor</th>
                <th className="px-5 py-4">Tracking</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    #{getShipmentOrderId(shipment).slice(0, 8) || "-"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {shipment.order?.buyer?.email ??
                      shipment.buyer?.email ??
                      "Sin comprador"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {typeLabels[shipment.type ?? ""] ?? shipment.type ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {carrierLabels[shipment.carrier ?? ""] ??
                      shipment.carrier ??
                      "-"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                      {statusLabels[shipment.status ?? "pending"] ??
                        shipment.status ??
                        "Pendiente"}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-slate-600">
                    {shipment.deliveryAddress ?? "-"}
                  </td>
                  <td className="max-w-xs px-5 py-4 text-slate-600">
                    {shipment.notes ?? shipment.phone ?? "-"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-600">
                        {shipment.driver?.email ??
                          shipment.driverId ??
                          "Sin asignar"}
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={driverInputs[shipment.id] ?? ""}
                          onChange={(event) =>
                            setDriverInputs((prev) => ({
                              ...prev,
                              [shipment.id]: event.target.value,
                            }))
                          }
                          placeholder="driverId"
                          className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleAssignDriver(shipment)}
                          disabled={workingShipmentId === shipment.id}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white disabled:bg-blue-300"
                        >
                          Asignar
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-600">
                        {shipment.trackingCode ?? "-"}
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={trackingInputs[shipment.id] ?? ""}
                          onChange={(event) =>
                            setTrackingInputs((prev) => ({
                              ...prev,
                              [shipment.id]: event.target.value,
                            }))
                          }
                          placeholder="Tracking"
                          className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateTracking(shipment)}
                          disabled={workingShipmentId === shipment.id}
                          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          runShipmentAction(
                            shipment.id,
                            () => markPickedUp(shipment.id),
                            "No se pudo marcar como retirado."
                          )
                        }
                        disabled={workingShipmentId === shipment.id}
                        className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white disabled:bg-amber-300"
                      >
                        Retirado
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runShipmentAction(
                            shipment.id,
                            () => markInTransit(shipment.id),
                            "No se pudo marcar en camino."
                          )
                        }
                        disabled={workingShipmentId === shipment.id}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:bg-indigo-300"
                      >
                        En camino
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runShipmentAction(
                            shipment.id,
                            () => markDelivered(shipment.id),
                            "No se pudo marcar entregado."
                          )
                        }
                        disabled={workingShipmentId === shipment.id}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white disabled:bg-green-300"
                      >
                        Entregado
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runShipmentAction(
                            shipment.id,
                            () => cancelShipment(shipment.id),
                            "No se pudo cancelar el envio."
                          )
                        }
                        disabled={workingShipmentId === shipment.id}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:bg-red-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminShipmentsPage;
