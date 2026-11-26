/**
 * DESCRIPTION
 * Booking rules are defined as constants in code
 * the same for every branch
 * Dates are "YYYY-MM-DD" and times are "HH:mm"
 */

export const BOOKINGS_PER_SLOT = 3; // Each time slot at a branch can be booked 3 times, across all services
export const SLOT_MINUTES = 30; // slot duration for all services, in minutes.
export const BOOKING_WINDOW_DAYS = 30; // Customers can book from today to 30 days in advance.

/** Opening hours by day of the week  */
export const TRADING_HOURS: Partial<
  Record<number, { opens: string; closes: string }>
> = {
  1: { opens: '09:00', closes: '15:00' },
  2: { opens: '09:00', closes: '15:00' },
  3: { opens: '09:00', closes: '15:00' },
  4: { opens: '09:00', closes: '15:00' },
  5: { opens: '09:00', closes: '15:00' },
  6: { opens: '09:00', closes: '13:00' },
};

export const TRADING_HOURS_TEXT =
  'Mon–Fri 09:00–15:00, Sat 09:00–13:00, closed Sundays and public holidays';

/** South African public holidays that fall on the same date every year ("MM-DD"). */
const FIXED_HOLIDAYS: Readonly<Record<string, string>> = {
  '01-01': "New Year's Day",
  '03-21': 'Human Rights Day',
  '04-27': 'Freedom Day',
  '05-01': "Workers' Day",
  '06-16': 'Youth Day',
  '08-09': "National Women's Day",
  '09-24': 'Heritage Day',
  '12-16': 'Day of Reconciliation',
  '12-25': 'Christmas Day',
  '12-26': 'Day of Goodwill',
};

/**
 * Easter Sunday for a year, as "YYYY-MM-DD". Uses the standard "Anonymous
 * Gregorian" calculation, which is correct for every year from 1583 onwards.
 */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Every South African public holiday in a year, as { "YYYY-MM-DD": name }.
 * Branches are closed on all of them. Works for any year, so there is no list
 * to keep up to date.
 */
export function publicHolidays(year: number): Record<string, string> {
  const holidays: Record<string, string> = {};

  for (const [monthDay, name] of Object.entries(FIXED_HOLIDAYS)) {
    const date = `${year}-${monthDay}`;
    holidays[date] = name;
    // When a holiday falls on a Sunday, the Monday after is also a holiday.
    if (new Date(`${date}T00:00:00Z`).getUTCDay() === 0) {
      holidays[addDays(date, 1)] = `${name} (observed)`;
    }
  }

  // Good Friday and Family Day move with Easter.
  const easter = easterSunday(year);
  holidays[addDays(easter, -2)] = 'Good Friday';
  holidays[addDays(easter, 1)] = 'Family Day';

  return holidays;
}

export const isPublicHoliday = (date: string) =>
  Object.hasOwn(publicHolidays(Number(date.slice(0, 4))), date);

/**
 * Convert a Date to a date and time string to use in a booking.
 * The time is rounded up to the next slot.
 *
 */
export function dateAndTime(now: Date): { date: string; time: string } {
  const iso = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/**
 * This function adds a number of days to a date string in "YYYY-MM-DD" format
 * and returns the resulting date string in the same format. It is used to
 * calculate the last date that can be booked, based on the booking window.
 * @param date
 * @param days
 * @returns The date string in "YYYY-MM-DD" format after adding the specified number of days
 */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Every slot start time on a date that a customer could book, ignoring how
 * full the slots are. Empty if the branch is closed (Sunday or public holiday), the date is outside the
 * booking window, or (for today) every slot has already started.
 */
export function slotTimes(date: string, now: Date): string[] {
  const today = dateAndTime(now);
  if (date < today.date || date > addDays(today.date, BOOKING_WINDOW_DAYS))
    return [];

  const hours = TRADING_HOURS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  if (!hours || isPublicHoliday(date)) return [];

  const times: string[] = [];
  for (
    let m = toMinutes(hours.opens);
    m + SLOT_MINUTES <= toMinutes(hours.closes);
    m += SLOT_MINUTES
  ) {
    const time = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    if (date > today.date || time > today.time) times.push(time);
  }
  return times;
}

/**
 * Format an appointment date and time for display.
 * e.g. "Tue, 01 Dec 2026 at 09:30".
 */
export function formatAppointment(date: string, time: string): string {
  const day = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `${day} at ${time}`;
}

const toMinutes = (hhmm: string) =>
  Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const pad = (n: number) => String(n).padStart(2, '0');
