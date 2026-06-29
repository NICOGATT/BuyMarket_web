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
  uploadTransferProof,
} from "../shared/services/payment.service";
import { createShipment } from "../shared/services/shipment.service";
import {
  createUserAddress,
  getMyAddresses,
} from "../shared/services/userAddress.service";
import type { CartItem } from "../shared/types/Cart";
import type { Order } from "../shared/types/Order";
import type {
  CreateShipmentPayload,
} from "../shared/types/Shipment";
import type {
  CreateUserAddressPayload,
  UserAddress,
} from "../shared/types/UserAddress";
import { getUserFromToken } from "../shared/utils/auth";
import { formatUserAddress } from "../shared/utils/userAddress";

type CheckoutForm = {
  paymentMethod: "cash" | "transfer" | "mercado_pago";
  notes: string;
};

type AddressMode = "saved" | "manual";
type CheckoutShipmentType = "local" | "national";

type CheckoutShipmentPayload = Omit<CreateShipmentPayload, "orderId">;

type CheckoutShipmentResult =
  | {
      deliveryAddress: string;
      shipmentPayload: CheckoutShipmentPayload;
      addressPayload?: CreateUserAddressPayload;
    }
  | {
      error: string;
    };

type ShippingAddressForm = {
  receiverName: string;
  phone: string;
  addressLine: string;
  street: string;
  number: string;
  floor: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  reference: string;
};

const transferAccount = {
  alias: import.meta.env.VITE_TRANSFER_ALIAS ?? "",
  cbu: import.meta.env.VITE_TRANSFER_CBU ?? "",
  holder: import.meta.env.VITE_TRANSFER_ACCOUNT_HOLDER ?? "",
};

const transferProofAcceptedTypes = ["image/jpeg", "image/png", "image/webp"];

const emptyShippingAddressForm: ShippingAddressForm = {
  receiverName: "",
  phone: "",
  addressLine: "",
  street: "",
  number: "",
  floor: "",
  apartment: "",
  city: "",
  province: "",
  postalCode: "",
  reference: "",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [form, setForm] = useState<CheckoutForm>({
    paymentMethod: "mercado_pago",
    notes: "",
  });
  const [shipmentType, setShipmentType] =
    useState<CheckoutShipmentType>("local");
  const [addressMode, setAddressMode] = useState<AddressMode>("manual");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [shippingAddressForm, setShippingAddressForm] =
    useState<ShippingAddressForm>(emptyShippingAddressForm);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [mercadoPagoOrder, setMercadoPagoOrder] = useState<Order | null>(null);
  const [transferOrder, setTransferOrder] = useState<Order | null>(null);
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
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
        const selectedAddress = defaultAddress ?? addressesData[0];

        setCart(cartData);
        setAddresses(addressesData);
        setSelectedAddressId(selectedAddress?.id ?? "");
        setAddressMode(selectedAddress ? "saved" : "manual");
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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleShippingAddressChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setShippingAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getSelectedAddress() {
    return addresses.find((address) => address.id === selectedAddressId) ?? null;
  }

  function buildLocalAddressLine(address: UserAddress) {
    const apartment = [address.floor, address.apartment]
      .filter(Boolean)
      .join(" ");

    return `${address.street} ${address.number}${
      apartment ? `, ${apartment}` : ""
    }`;
  }

  function getFallbackReceiverName() {
    const user = getUserFromToken();

    return user?.name?.trim() || user?.email?.trim() || "Comprador";
  }

  function buildShipmentNotes(receiverName: string, phone: string, notes?: string) {
    return [
      `Telefono: ${phone}`,
      receiverName ? `Recibe: ${receiverName}` : "",
      notes ? `Referencia: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(". ");
  }

  function buildCheckoutShipment(): CheckoutShipmentResult {
    const selectedAddress = getSelectedAddress();
    const fallbackReceiverName = getFallbackReceiverName();

    if (addressMode === "saved") {
      if (!selectedAddress) {
        return { error: "Selecciona una direccion guardada." };
      }

      const phone = selectedAddress.phone?.trim();
      const receiverName =
        selectedAddress.receiverName?.trim() || fallbackReceiverName;

      if (!phone) {
        return {
          error: "La direccion guardada no tiene telefono de contacto.",
        };
      }

      if (shipmentType === "local") {
        const addressLine = buildLocalAddressLine(selectedAddress);
        const city = selectedAddress.city.trim();

        if (!addressLine.trim() || !city) {
          return { error: "La direccion guardada no tiene datos suficientes." };
        }

        return {
          deliveryAddress: `Envio local - ${addressLine}, ${city}. Telefono: ${phone}${
            receiverName ? `. Recibe: ${receiverName}` : ""
          }`,
          shipmentPayload: {
            type: "local_delivery",
            carrier: "buymarket",
            deliveryAddress: `Envio local - ${addressLine}, ${city}`,
            notes: buildShipmentNotes(
              receiverName,
              phone,
              selectedAddress.reference?.trim()
            ),
          },
        };
      }

      const formattedAddress = formatUserAddress(selectedAddress);

      return {
        deliveryAddress: `Envio nacional - ${formattedAddress}. Telefono: ${phone}${
          receiverName ? `. Recibe: ${receiverName}` : ""
        }`,
        shipmentPayload: {
          type: "national_shipping",
          carrier: "buymarket",
          deliveryAddress: `Envio nacional - ${formattedAddress}`,
          notes: buildShipmentNotes(
            receiverName,
            phone,
            selectedAddress.reference?.trim()
          ),
        },
      };
    }

    if (shipmentType === "local") {
      const receiverName =
        shippingAddressForm.receiverName.trim() || fallbackReceiverName;
      const phone = shippingAddressForm.phone.trim();
      const addressLine = shippingAddressForm.addressLine.trim();
      const city = shippingAddressForm.city.trim();
      const reference = shippingAddressForm.reference.trim();

      if (!addressLine || !city || !phone) {
        return {
          error: "Ingresa la direccion, localidad y telefono del envio local.",
        };
      }

      const deliveryAddress = `Envio local - ${addressLine}, ${city}. Telefono: ${phone}${
        receiverName ? `. Recibe: ${receiverName}` : ""
      }${reference ? `. Referencia: ${reference}` : ""}`;

      return {
        deliveryAddress,
        shipmentPayload: {
          type: "local_delivery",
          carrier: "buymarket",
          deliveryAddress: `Envio local - ${addressLine}, ${city}`,
          notes: buildShipmentNotes(receiverName, phone, reference),
        },
        addressPayload: {
          label: "Checkout local",
          receiverName,
          phone,
          street: addressLine,
          number: "S/N",
          city,
          province: city,
          postalCode: "0000",
          reference: reference || undefined,
          isDefault: false,
        },
      };
    }

    const receiverName =
      shippingAddressForm.receiverName.trim() || fallbackReceiverName;
    const phone = shippingAddressForm.phone.trim();
    const nationalAddress = {
      street: shippingAddressForm.street.trim(),
      number: shippingAddressForm.number.trim(),
      city: shippingAddressForm.city.trim(),
      province: shippingAddressForm.province.trim(),
      postalCode: shippingAddressForm.postalCode.trim(),
      phone,
      receiverName: receiverName || undefined,
      floor: shippingAddressForm.floor.trim() || undefined,
      apartment: shippingAddressForm.apartment.trim() || undefined,
      reference: shippingAddressForm.reference.trim() || undefined,
    };

    if (
      !nationalAddress.street ||
      !nationalAddress.number ||
      !nationalAddress.city ||
      !nationalAddress.province ||
      !nationalAddress.postalCode ||
      !nationalAddress.phone
    ) {
      return {
        error:
          "Completa calle, numero, localidad, provincia, codigo postal y telefono.",
      };
    }

    const optionalApartment = [nationalAddress.floor, nationalAddress.apartment]
      .filter(Boolean)
      .join(" ");
    const deliveryAddress = `${nationalAddress.street} ${nationalAddress.number}${
      optionalApartment ? `, ${optionalApartment}` : ""
    }, ${nationalAddress.city}, ${nationalAddress.province} (${
      nationalAddress.postalCode
    })`;

    return {
      deliveryAddress: `Envio nacional - ${deliveryAddress}. Telefono: ${phone}${
        receiverName ? `. Recibe: ${receiverName}` : ""
      }${nationalAddress.reference ? `. Referencia: ${nationalAddress.reference}` : ""}`,
      shipmentPayload: {
        type: "national_shipping",
        carrier: "buymarket",
        deliveryAddress: `Envio nacional - ${deliveryAddress}`,
        notes: buildShipmentNotes(receiverName, phone, nationalAddress.reference),
      },
      addressPayload: {
        label: "Checkout nacional",
        receiverName,
        phone,
        street: nationalAddress.street,
        number: nationalAddress.number,
        city: nationalAddress.city,
        province: nationalAddress.province,
        postalCode: nationalAddress.postalCode,
        floor: nationalAddress.floor,
        apartment: nationalAddress.apartment,
        reference: nationalAddress.reference,
        isDefault: false,
      },
    };
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

    if (!transferProofFile) {
      setError("Subi una imagen del comprobante de transferencia.");
      return;
    }

    if (!transferProofAcceptedTypes.includes(transferProofFile.type)) {
      setError("El comprobante debe ser una imagen JPG, PNG o WebP.");
      return;
    }

    const paymentId = transferOrder.payment?.id;

    if (!paymentId) {
      setError("No se encontro el pago asociado a la orden.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await uploadTransferProof(paymentId, transferProofFile);
      setIsTransferNotified(true);
    } catch {
      setError("No se pudo enviar el comprobante. Intentalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const shipmentResult = buildCheckoutShipment();

    if ("error" in shipmentResult) {
      setError(shipmentResult.error);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setMercadoPagoOrder(null);
      setTransferOrder(null);
      setTransferProofFile(null);
      setIsTransferNotified(false);
      const order = await checkoutOrder({
        deliveryAddress: shipmentResult.deliveryAddress,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
      });

      if (form.paymentMethod === "mercado_pago") {
        setCart([]);
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
        setMercadoPagoOrder(order);
        await redirectToMercadoPago(order);
        return;
      }

      if (form.paymentMethod === "transfer") {
        if (shipmentResult.addressPayload) {
          const createdAddress = await createUserAddress(
            shipmentResult.addressPayload
          );
          setAddresses((prev) => [...prev, createdAddress]);
          setSelectedAddressId(createdAddress.id);
          setAddressMode("saved");
        }

        await createShipment({
          orderId: order.id,
          ...shipmentResult.shipmentPayload,
        });

        setCart([]);
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
        setTransferOrder(order);
        return;
      }

      setCart([]);
      window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      setCreatedOrder(order);
    } catch (submitError) {
      if (isAuthRequiredError(submitError)) {
        navigate("/login");
        return;
      }

      setError(
        mercadoPagoOrder
          ? "No se pudo abrir Mercado Pago. Intentalo nuevamente."
          : submitError instanceof Error
            ? submitError.message
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
          ${transferOrder.total.toLocaleString("es-AR")} y subi el comprobante
          para que podamos confirmar el pago.
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
              Comprobante enviado
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
                Comprobante de transferencia
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setTransferProofFile(event.target.files?.[0] ?? null)
                }
                className="w-full rounded-xl border border-amber-300 px-4 py-3 outline-none focus:border-amber-600"
              />
              <span className="mt-2 block text-sm font-semibold text-amber-800">
                Formatos permitidos: JPG, PNG o WebP.
              </span>
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
              {isSubmitting ? "Enviando comprobante..." : "Enviar comprobante"}
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
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="m-0 text-xl font-black text-slate-950">
              Tipo de envio
            </h2>

            <label className="mt-4 block">
              <span className="mb-2 block font-bold text-slate-700">
                Metodo de envio
              </span>
              <select
                value={shipmentType}
                onChange={(event) =>
                  setShipmentType(event.target.value as CheckoutShipmentType)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600"
              >
                <option value="local">Envio local</option>
                <option value="national">Envio nacional</option>
              </select>
            </label>

            {addresses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAddressMode("saved")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    addressMode === "saved"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-blue-50"
                  }`}
                >
                  Usar direccion guardada
                </button>
                <button
                  type="button"
                  onClick={() => setAddressMode("manual")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    addressMode === "manual"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-blue-50"
                  }`}
                >
                  Usar otra direccion
                </button>
              </div>
            )}

            {addressMode === "saved" && addresses.length > 0 ? (
              <label className="mt-4 block">
                <span className="mb-2 block font-bold text-slate-700">
                  Direccion guardada
                </span>
                <select
                  value={selectedAddressId}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-blue-600"
                >
                  <option value="">Seleccionar direccion</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} - {formatUserAddress(address)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {shipmentType === "local" ? (
                  <>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Nombre de quien recibe
                      </span>
                      <input
                        name="receiverName"
                        value={shippingAddressForm.receiverName}
                        onChange={handleShippingAddressChange}
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Telefono de contacto
                      </span>
                      <input
                        name="phone"
                        value={shippingAddressForm.phone}
                        onChange={handleShippingAddressChange}
                        placeholder="Telefono"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block font-bold text-slate-700">
                        Direccion
                      </span>
                      <input
                        name="addressLine"
                        value={shippingAddressForm.addressLine}
                        onChange={handleShippingAddressChange}
                        placeholder="Calle, numero o referencia"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block font-bold text-slate-700">
                        Localidad
                      </span>
                      <input
                        name="city"
                        value={shippingAddressForm.city}
                        onChange={handleShippingAddressChange}
                        placeholder="Localidad"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Nombre de quien recibe
                      </span>
                      <input
                        name="receiverName"
                        value={shippingAddressForm.receiverName}
                        onChange={handleShippingAddressChange}
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Telefono de contacto
                      </span>
                      <input
                        name="phone"
                        value={shippingAddressForm.phone}
                        onChange={handleShippingAddressChange}
                        placeholder="Telefono"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Calle
                      </span>
                      <input
                        name="street"
                        value={shippingAddressForm.street}
                        onChange={handleShippingAddressChange}
                        placeholder="Calle"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Numero
                      </span>
                      <input
                        name="number"
                        value={shippingAddressForm.number}
                        onChange={handleShippingAddressChange}
                        placeholder="Numero"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Localidad
                      </span>
                      <input
                        name="city"
                        value={shippingAddressForm.city}
                        onChange={handleShippingAddressChange}
                        placeholder="Localidad"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Provincia
                      </span>
                      <input
                        name="province"
                        value={shippingAddressForm.province}
                        onChange={handleShippingAddressChange}
                        placeholder="Provincia"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Codigo postal
                      </span>
                      <input
                        name="postalCode"
                        value={shippingAddressForm.postalCode}
                        onChange={handleShippingAddressChange}
                        placeholder="Codigo postal"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Piso
                      </span>
                      <input
                        name="floor"
                        value={shippingAddressForm.floor}
                        onChange={handleShippingAddressChange}
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block font-bold text-slate-700">
                        Departamento
                      </span>
                      <input
                        name="apartment"
                        value={shippingAddressForm.apartment}
                        onChange={handleShippingAddressChange}
                        placeholder="Opcional"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block font-bold text-slate-700">
                        Referencia
                      </span>
                      <textarea
                        name="reference"
                        value={shippingAddressForm.reference}
                        onChange={handleShippingAddressChange}
                        placeholder="Indicaciones adicionales"
                        className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </section>

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
