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
  'Mon–Fri 09:00–15:00, Sat 09:00–13:00, closed Sundays';

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
 * full the slots are. Empty if the branch is closed, the date is outside the
 * booking window, or (for today) every slot has already started.
 */
export function slotTimes(date: string, now: Date): string[] {
  const today = dateAndTime(now);
  if (date < today.date || date > addDays(today.date, BOOKING_WINDOW_DAYS))
    return [];

  const hours = TRADING_HOURS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  if (!hours) return [];

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
