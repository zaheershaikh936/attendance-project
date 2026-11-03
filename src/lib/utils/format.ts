import { type DateValue } from 'date-fns';
import { formatRelativeTime, timezoneFormat } from 'date-fns-tz';

/**
 * Format a date to locale string (e.g., "Monday, November 3, 2024")
 */
export function formatDate(date: DateValue | number): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date to short string (e.g., "11/03/2024")
 */
export function formatShortDate(date: DateValue | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/**
 * Format date to time only (e.g., "08:00 AM")
 */
export function formatTime(date: DateValue | number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: DateValue | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date)).replace('AM', '').replace('PM', '');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: DateValue | number): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date));
}

/**
 * Format duration to string (e.g., "45 minutes")
 */
export function formatDuration(start: number, end: number): string {
  const diff = Math.abs(end - start);

  if (diff < 60000) {
    return `${Math.round(diff / 1000)} second${Math.round(diff / 1000) > 1 ? 's' : ''}`;
  }

  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * Format date with timezone (e.g., "November 3, 2024 8:00 AM PST")
 */
export function formatDateWithTimezone(
  date: DateValue | number,
  timeZone: string = 'UTC',
): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: timeZone,
  }).format(new Date(date));
}

/**
 * Get days between two dates
 */
export function getDaysBetween(start: number, end: number): number {
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get working days between two dates (excluding weekends)
 */
export function getWorkingDaysBetween(start: number, end: number): number {
  const date = new Date(start);
  let count = 0;

  while (date < new Date(end)) {
    if (!isWeekend(date)) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }

  return count;
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: DateValue | number): boolean {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday and Saturday
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  return new Intl.NumberFormat('en-US', options).format(amount);
}

/**
 * Parse date from string to Date object
 */
export function parseDate(str: string): Date {
  if (!str) return new Date();
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Truncate long text to specified length
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
