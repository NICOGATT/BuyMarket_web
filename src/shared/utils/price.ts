export function parsePriceInput(value: string): number | null {
  const match = value.trim().match(/^(\d+)(?:[.,](\d{1,2}))?$/);

  if (!match) return null;

  const wholePesos = Number(match[1]);
  const decimalCents = Number((match[2] ?? "").padEnd(2, "0"));
  const totalCents = wholePesos * 100 + decimalCents;

  if (!Number.isSafeInteger(totalCents)) return null;

  return totalCents / 100;
}

export function normalizePriceInput(value: string): string | null {
  const price = parsePriceInput(value);

  return price === null ? null : price.toFixed(2);
}

export function formatPrice(value: number | string): string {
  const price = Number(value);

  return (Number.isFinite(price) ? price : 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
