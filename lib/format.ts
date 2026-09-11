/** Format a price with Persian digits and the «تومان» unit. */
export function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(Math.round(value));
  return `${formatted} تومان`;
}

/** Format a number with Persian digits, e.g. ۱۲۴ */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

/** Format a large number compactly in Persian units, e.g. ۵۰۰ هزار / ۲ میلیون. */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value / 1_000_000_000)} میلیارد`;
  }
  if (value >= 1_000_000) {
    return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value / 1_000_000)} میلیون`;
  }
  if (value >= 1_000) {
    return `${new Intl.NumberFormat("fa-IR").format(Math.round(value / 1_000))} هزار`;
  }
  return new Intl.NumberFormat("fa-IR").format(value);
}

/** Format a discount percent, e.g. ۲۵٪ */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(Math.round(value))}٪`;
}

/** Format an ISO date in Persian, e.g. ۱۴ تیر ۱۴۰۵ */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
