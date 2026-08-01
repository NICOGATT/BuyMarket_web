import type {
  CreateUserAddressPayload,
  UserAddress,
} from "../types/UserAddress";

export const emptyAddressForm: CreateUserAddressPayload = {
  label: "",
  receiverName: "",
  phone: "",
  street: "",
  number: "",
  floor: "",
  apartment: "",
  city: "",
  province: "",
  postalCode: "",
  reference: "",
  isDefault: false,
};

export function formatUserAddress(address: UserAddress) {
  const apartment = [address.floor, address.apartment]
    .filter(Boolean)
    .join(" ");
  const streetLine = `${address.street} ${address.number}${
    apartment ? `, ${apartment}` : ""
  }`;

  return `${streetLine}, ${address.city}, ${address.province} (${address.postalCode})`;
}

export function buildAddressPayload(
  form: CreateUserAddressPayload,
  defaultReceiverName: string
): CreateUserAddressPayload | string {
  const receiverName = form.receiverName?.trim() || defaultReceiverName.trim();
  const payload: CreateUserAddressPayload = {
    label: form.label.trim(),
    receiverName,
    phone: form.phone.trim(),
    street: form.street.trim(),
    number: form.number.trim(),
    city: form.city.trim(),
    province: form.province.trim(),
    postalCode: form.postalCode.trim(),
    isDefault: Boolean(form.isDefault),
  };

  if (!payload.label) return "Ingresa una etiqueta para la direccion.";
  if (!payload.phone) return "Ingresa un telefono de contacto.";
  if (!payload.street) return "Ingresa la calle.";
  if (!payload.number) return "Ingresa el numero.";
  if (!payload.city) return "Ingresa la ciudad o localidad.";
  if (!payload.province) return "Ingresa la provincia.";
  if (!payload.postalCode) return "Ingresa el codigo postal.";

  const floor = form.floor?.trim();
  const apartment = form.apartment?.trim();
  const reference = form.reference?.trim();

  if (floor) payload.floor = floor;
  if (apartment) payload.apartment = apartment;
  if (reference) payload.reference = reference;

  return payload;
}
