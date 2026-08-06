// Mirrors api/lib/date.js — keeps "today" consistent between frontend and
// backend regardless of the browser's local timezone. Using the IANA name
// (rather than a fixed -05:00 offset) means this stays correct across the
// EST/EDT switch automatically.
export function todayEastern() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// "2026-08-03" -> "SUNDAY, AUGUST 3, 2026". Parsed as UTC noon to avoid the
// date shifting a day off in browsers west of UTC.
export function formatLongDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  })
    .format(d)
    .toUpperCase();
}
