/**
 * Date utility functions for DAWN
 * Uses local dates to avoid timezone-shift bugs when calculating streaks and calendar entries.
 */

/**
 * Returns YYYY-MM-DD representation of a Date in the user's local timezone
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date at midnight local time
 */
export function parseLocalDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return new Date();
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Calculates the whole integer difference in calendar days between two YYYY-MM-DD dates (to - from)
 */
export function daysBetween(fromStr: string, toStr: string): number {
  const fromDate = parseLocalDateString(fromStr);
  const toDate = parseLocalDateString(toStr);
  const msDiff = toDate.getTime() - fromDate.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Adds or subtracts days from a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDateString(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/**
 * Checks if a dateStr matches today's local date
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

/**
 * Formats YYYY-MM-DD to friendly human header: e.g., "Monday, Nov 2"
 */
export function formatDateFriendly(dateStr: string): string {
  const d = parseLocalDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats YYYY-MM-DD to long friendly format: e.g., "November 2, 2026"
 */
export function formatDateFull(dateStr: string): string {
  const d = parseLocalDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generates array of the last N day strings ending on today
 */
export function getPastNDays(n: number, endDateStr?: string): string[] {
  const end = endDateStr || getLocalDateString();
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDays(end, -i));
  }
  return days;
}

/**
 * Generates calendar grid cells for a given month (0-indexed month)
 */
export interface CalendarCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function getMonthGrid(year: number, month: number): CalendarCell[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  
  const todayStr = getLocalDateString();
  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = [];

  // Previous month trailing days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDate - i;
    const prevMonthStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    currentWeek.push({
      dateStr: prevMonthStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: prevMonthStr === todayStr,
      isFuture: prevMonthStr > todayStr,
    });
  }

  // Days in current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    currentWeek.push({
      dateStr: dStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      isFuture: dStr > todayStr,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month leading days
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      const nextMonthStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      currentWeek.push({
        dateStr: nextMonthStr,
        dayNumber: nextDay,
        isCurrentMonth: false,
        isToday: nextMonthStr === todayStr,
        isFuture: nextMonthStr > todayStr,
      });
      nextDay++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
