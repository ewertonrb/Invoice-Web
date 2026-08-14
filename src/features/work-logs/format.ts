export function formatWorkedHours(minutes: number | null | undefined) {
  if (minutes == null) return "Not calculated";
  const hours = minutes / 60;
  return `${Number(hours.toFixed(2))} ${hours === 1 ? "hour" : "hours"}`;
}
