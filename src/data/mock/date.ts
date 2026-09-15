const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export function now() {
  return new Date();
}

export function minutesAgo(value: number) {
  return new Date(now().getTime() - value * minute).toISOString();
}

export function hoursAgo(value: number) {
  return new Date(now().getTime() - value * hour).toISOString();
}

export function daysAgo(value: number) {
  return new Date(now().getTime() - value * day).toISOString();
}

export function daysFromNow(value: number) {
  return new Date(now().getTime() + value * day).toISOString();
}

export function todayAt(hourValue: number, minuteValue = 0) {
  const date = now();
  date.setHours(hourValue, minuteValue, 0, 0);
  return date.toISOString();
}

export function laterToday(minutesAhead: number) {
  const current = now();
  const date = new Date(current.getTime() + minutesAhead * minute);

  if (
    date.getFullYear() !== current.getFullYear() ||
    date.getMonth() !== current.getMonth() ||
    date.getDate() !== current.getDate()
  ) {
    current.setHours(23, 59, 0, 0);
    return current.toISOString();
  }

  return date.toISOString();
}

export function tomorrowAt(hourValue: number, minuteValue = 0) {
  const date = now();
  date.setDate(date.getDate() + 1);
  date.setHours(hourValue, minuteValue, 0, 0);
  return date.toISOString();
}

export function yesterdayAt(hourValue: number, minuteValue = 0) {
  const date = now();
  date.setDate(date.getDate() - 1);
  date.setHours(hourValue, minuteValue, 0, 0);
  return date.toISOString();
}

export function isTodayIso(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const current = now();
  return (
    date.getFullYear() === current.getFullYear() &&
    date.getMonth() === current.getMonth() &&
    date.getDate() === current.getDate()
  );
}

export function isPastIso(value: string | null) {
  return Boolean(value && new Date(value).getTime() < now().getTime());
}

export function daysBetweenNowAnd(value: string | null) {
  if (!value) return 0;
  return Math.floor((now().getTime() - new Date(value).getTime()) / day);
}
