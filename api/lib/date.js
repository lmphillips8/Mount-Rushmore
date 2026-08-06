// Returns today's date as "YYYY-MM-DD" in America/New_York time — not the
// server's UTC date. Using the IANA timezone name (rather than a fixed
// -05:00 offset) means this stays correct across the EST/EDT switch
// automatically; Node's Intl support handles the DST math for us.
export function todayEastern() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
