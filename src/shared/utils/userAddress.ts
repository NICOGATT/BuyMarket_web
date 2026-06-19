import type { UserAddress } from "../types/UserAddress";

export function formatUserAddress(address: UserAddress) {
  const apartment = [address.floor, address.apartment]
    .filter(Boolean)
    .join(" ");
  const streetLine = `${address.street} ${address.number}${
    apartment ? `, ${apartment}` : ""
  }`;

  return `${streetLine}, ${address.city}, ${address.province} (${address.postalCode})`;
}
