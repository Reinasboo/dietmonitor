import {
  format,
  parseISO,
  isToday,
  isYesterday,
  isThisWeek,
  differenceInDays,
} from 'date-fns';

export function parseTimezoneOffsetMinutes(timezone: string = 'UTC'): number {
  if (!timezone || timezone === 'UTC') return 0;

  const match = timezone.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return sign * (hours * 60 + minutes);
}

export function toTimezoneDate(date: Date, timezone: string = 'UTC'): Date {
  const offsetMinutes = parseTimezoneOffsetMinutes(timezone);
  return new Date(date.getTime() + offsetMinutes * 60_000);
}

export function getHourInTimezone(dateString: string, timezone: string = 'UTC'): number {
  const shifted = toTimezoneDate(parseISO(dateString), timezone);
  return shifted.getUTCHours();
}

export function getMinuteInTimezone(dateString: string, timezone: string = 'UTC'): number {
  const shifted = toTimezoneDate(parseISO(dateString), timezone);
  return shifted.getUTCMinutes();
}

export function getDayKeyInTimezone(dateString: string, timezone: string = 'UTC'): string {
  const shifted = toTimezoneDate(parseISO(dateString), timezone);
  return shifted.toISOString().split('T')[0];
}

export function formatTimeForDisplay(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'h:mm a');
}

export function formatDateForDisplay(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }

  return format(date, 'MMM d, yyyy');
}

export function formatFullDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function isDateInWeek(targetDate: Date, weekStart: Date): boolean {
  const weekEnd = getWeekEnd(weekStart);
  return targetDate >= weekStart && targetDate <= weekEnd;
}

export function getMondayOfWeek(date: Date = new Date(), timezone: string = 'UTC'): string {
  const shifted = toTimezoneDate(date, timezone);
  const day = shifted.getUTCDay();
  const diff = shifted.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), diff));
  return monday.toISOString().split('T')[0];
}
