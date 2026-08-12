const LOCALE = "id-ID";
// Pinned explicitly — this app is Indonesia-only, and the server the code
// runs on (dev machine, CI, or whatever host production ends up on) isn't
// guaranteed to have its OS/process timezone set to WIB. Without this,
// Intl.DateTimeFormat falls back to the runtime's default tz, which on most
// cloud hosts is UTC — every displayed date/time would then be off by 7h.
const TIME_ZONE = "Asia/Jakarta";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}
