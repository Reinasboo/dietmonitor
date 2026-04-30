import {
  format,
  parseISO,
  isToday,
  isYesterday,
  isThisWeek,
  differenceInDays,
} from 'date-fns';

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

export function getMondayOfWeek(date: Date = new Date()): string {
  const monday = getWeekStart(date);
  return monday.toISOString().split('T')[0];
}
