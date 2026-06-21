import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CART_CHANGE_EVENT,
  getCart,
  isAuthRequiredError,
} from "../features/cart/store/cartStore";
import { checkoutOrder } from "../shared/services/order.service";
import {
  createMercadoPagoPreference,
  notifyTransferPayment,
} from "../shared/services/payment.service";
import { getMyAddresses } from "../shared/services/userAddress.service";
import type { CartItem } from "../shared/types/Cart";
import type { Order } from "../shared/types/Order";
import type { UserAddress } from "../shared/types/UserAddress";
import { formatUserAddress } from "../shared/utils/userAddress";

type CheckoutForm = {
  addressId: string;
  deliveryAddress: string;
  paymentMethod: "cash" | "transfer" | "mercado_pago";
  notes: string;
};

const transferAccount = {
  alias: import.meta.env.VITE_TRANSFER_ALIAS ?? "",
  cbu: import.meta.env.VITE_TRANSFER_CBU ?? "",
  holder: import.meta.env.VITE_TRANSFER_ACCOUNT_HOLDER ?? "",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [form, setForm] = useState<CheckoutForm>({
    addressId: "",
    deliveryAddress: "",
    paymentMethod: "mercado_pago",
    notes: "",
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [mercadoPagoOrder, setMercadoPagoOrder] = useState<Order | null>(null);
  const [transferOrder, setTransferOrder] = useState<Order | null>(null);
  const [transferAlias, setTransferAlias] = useState("");
  const [isTransferNotified, setIsTransferNotified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCheckout() {
      try {
        const [cartData, addressesData] = await Promise.all([
          getCart(),
          getMyAddresses().catch(() => []),
        ]);
        const defaultAddress = addressesData.find((address) => address.isDefault);

        setCart(cartData);
        setAddresses(addressesData);
        setForm((prev) => ({
          ...prev,
          addressId: defaultAddress?.id ?? "",
          deliveryAddress: defaultAddress ? formatUserAddress(defaultAddress) : "",
        }));
      } catch (loadError) {
        if (isAuthRequiredError(loadError)) {
          navigate("/login");
          return;
        }

        setError("No se pudo cargar el formulario de compra.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCheckout();
  }, [navigate]);

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    if (name === "addressId") {
      const selectedAddress = addresses.find((address) => address.id === value);
      setForm((prev) => ({
        ...prev,
        addressId: value,
        deliveryAddress: selectedAddress ? formatUserAddress(selectedAddress) : "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function redirectToMercadoPago(order: Order) {
    const preference = await createMercadoPagoPreference(order.id);
    const redirectUrl = import.meta.env.DEV
      ? preference.sandboxInitPoint ?? preference.initPoint
      : preference.initPoint ?? preference.sandboxInitPoint;

    if (!redirectUrl) {
      throw new Error("Mercado Pago no devolvio un link de pago.");
    }

    window.location.href = redirectUrl;
  }

  async function handleRetryMercadoPago() {
    if (!mercadoPagoOrder) return;

    try {
      setIsSubmitting(true);
      setError("");
      await redirectToMercadoPago(mercadoPagoOrder);
    } catch {
      setError("No se pudo abrir Mercado Pago. Intentalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNotifyTransfer(event: React.FormEvent) {
    event.preventDefault();

    if (!transferOrder) return;

    if (!transferAlias.trim()) {
      setError("Ingresa el alias desde el que hiciste la transferencia.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await notifyTransferPayment(transferOrder.id, transferAlias.trim());
      setIsTransferNotified(true);
    } catch {
      setError("No se pudo informar la transferencia. Intentalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.deliveryAddress.trim()) {
      setError("Ingresa la direccion de entrega.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMercadoPagoOrder(null);
      setTransferOrder(null);
      setIsTransferNotified(false);
      const order = await checkoutOrder({
        deliveryAddress: form.deliveryAddress.trim(),
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
      });

      setCart([]);
      window.dispatchEvent(new Event(CART_CHANGE_EVENT));

      if (form.paymentMethod === "mercado_pago") {
        setMercadoPagoOrder(order);
        await redirectToMercadoPago(order);
        return;
      }

      if (form.paymentMethod === "transfer") {
        setTransferOrder(order);
        return;
      }

      setCreatedOrder(order);
    } catch (submitError) {
      if (isAuthRequiredError(submitError)) {
        navigate("/login");
        return;
      }

      setError(
        mercadoPagoOrder
          ? "No se pudo abrir Mercado Pago. Intentalo nuevamente."
          : "No se pudo confirmar la compra."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando compra...</p>;
  }

  if (createdOrder) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-green-200 bg-green-50 p-8">
        <h1 className="m-0 text-3xl font-black text-green-900">
          Compra confirmada
        </h1>
        <p className="mt-2 font-semibold text-green-700">
          Orden #{createdOrder.id.slice(0, 8)} creada correctamente.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
        >
          Seguir comprando
        </Link>
      </section>
    );
  }

  if (mercadoPagoOrder) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-blue-200 bg-blue-50 p-8">
        <h1 className="m-0 text-3xl font-black text-blue-950">
          Orden creada
        </h1>
        <p className="mt-2 font-semibold text-blue-800">
          La orden #{mercadoPagoOrder.id.slice(0, 8)} esta pendiente de pago en
          Mercado Pago.
        </p>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleRetryMercadoPago}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Abriendo Mercado Pago..." : "Pagar con Mercado Pago"}
        </button>
      </section>
    );
  }

  if (transferOrder) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="m-0 text-3xl font-black text-amber-950">
          Transferencia pendiente
        </h1>
        <p className="mt-2 font-semibold text-amber-800">
          Orden #{transferOrder.id.slice(0, 8)} creada correctamente. Transferi
          ${transferOrder.total.toLocaleString("es-AR")} y avisanos el alias de
          origen para que podamos confirmar el pago.
        </p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-5">
          <h2 className="m-0 text-lg font-black text-slate-950">
            Datos para transferir
          </h2>

          <div className="mt-4 space-y-3">
            <p className="rounded-xl bg-slate-50 p-3">
              <span className="block text-sm font-bold text-slate-500">
                Alias
              </span>
              <strong className="text-slate-950">
                {transferAccount.alias || "Configurar VITE_TRANSFER_ALIAS"}
              </strong>
            </p>

            <p className="rounded-xl bg-slate-50 p-3">
              <span className="block text-sm font-bold text-slate-500">
                CBU
              </span>
              <strong className="text-slate-950">
                {transferAccount.cbu || "Configurar VITE_TRANSFER_CBU"}
              </strong>
            </p>

            {transferAccount.holder && (
              <p className="rounded-xl bg-slate-50 p-3">
                <span className="block text-sm font-bold text-slate-500">
                  Titular
                </span>
                <strong className="text-slate-950">
                  {transferAccount.holder}
                </strong>
              </p>
            )}
          </div>
        </div>

        {isTransferNotified ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <h2 className="m-0 text-xl font-black text-green-900">
              Transferencia informada
            </h2>
            <p className="mt-2 font-semibold text-green-700">
              Tu pago quedo pendiente de aprobacion. Cuando el sistema lo
              confirme, avanzaremos con la asignacion del repartidor.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Seguir comprando
            </Link>
          </div>
        ) : (
          <form onSubmit={handleNotifyTransfer} className="mt-6">
            <label className="block">
              <span className="mb-2 block font-bold text-amber-900">
                Alias desde el que transferiste
              </span>
              <input
                value={transferAlias}
                onChange={(event) => setTransferAlias(event.target.value)}
                placeholder="tu.alias"
                className="w-full rounded-xl border border-amber-300 px-4 py-3 outline-none focus:border-amber-600"
              />
            </label>

            {error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-amber-700 px-6 py-4 font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {isSubmitting ? "Informando transferencia..." : "Informar transferencia"}
            </button>
          </form>
        )}
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10">
        <h1 className="text-2xl font-black text-slate-900">
          Tu carrito esta vacio
        </h1>
        <Link
          to="/products"
          className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Ver productos
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="m-0 text-3xl font-black text-slate-950">
          Formulario de compra
        </h1>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Direccion guardada
            </span>
            <select
              name="addressId"
              value={form.addressId}
              onChange={handleChange}
              disabled={addresses.length === 0}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="">
                {addresses.length === 0
                  ? "No tenes direcciones guardadas"
                  : "Seleccionar direccion"}
              </option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label} - {formatUserAddress(address)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Direccion de entrega
            </span>
            <input
              name="deliveryAddress"
              value={form.deliveryAddress}
              onChange={handleChange}
              placeholder="Calle, numero, ciudad"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Metodo de pago
            </span>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600"
            >
              <option value="mercado_pago">Mercado Pago</option>
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Notas
            </span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Indicaciones para la entrega"
              className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
        </div>

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting
            ? form.paymentMethod === "mercado_pago"
              ? "Abriendo Mercado Pago..."
              : "Confirmando..."
            : form.paymentMethod === "mercado_pago"
              ? "Pagar con Mercado Pago"
              : "Confirmar compra"}
        </button>
      </form>

      <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white">
        <h2 className="m-0 text-xl font-black">Resumen</h2>

        <div className="mt-5 space-y-3">
          {cart.map((item) => (
            <article
              key={item.id ?? item.product.id}
              className="flex items-center justify-between gap-4 border-b border-white/10 pb-3"
            >
              <div className="min-w-0">
                <p className="truncate font-bold">{item.product.title}</p>
                <p className="text-sm font-semibold text-slate-300">
                  x{item.quantity}
                </p>
              </div>
              <strong>
                ${(item.product.price * item.quantity).toLocaleString("es-AR")}
              </strong>
            </article>
          ))}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="font-semibold text-slate-300">Total</p>
          <strong className="text-3xl">${total.toLocaleString("es-AR")}</strong>
        </div>
      </aside>
    </section>
  );
}

export default CheckoutPage;
