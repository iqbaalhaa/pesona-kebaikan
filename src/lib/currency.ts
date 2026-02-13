export function rupiah(n: number, maximumFractionDigits: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits,
  }).format(Math.round(Number(n) || 0));
}

export function idr(n: number, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number; withPrefix?: boolean }) {
  const minimumFractionDigits = options?.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options?.maximumFractionDigits ?? 0;
  const withPrefix = options?.withPrefix ?? true;
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(n) || 0);
  return withPrefix ? formatted : formatted.replace(/^Rp\s*/i, "");
}

export function formatIDRInput(numStr: string) {
  const digits = (numStr || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseIDRInput(numStr: string) {
  const digits = (numStr || "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}
