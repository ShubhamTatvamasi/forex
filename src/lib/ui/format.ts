export const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

const inrFmt = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹ with Indian digit grouping and two decimals, e.g. "₹48,320.00". */
export function inr(amount: number): string {
  return `₹${inrFmt.format(amount)}`;
}

/** ₹ with Indian digit grouping and no decimals, e.g. "₹10,00,000". */
export function inr0(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
}

/** Plain number with Indian digit grouping, e.g. "10,00,000". */
export function group(value: number, decimals = 0): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
