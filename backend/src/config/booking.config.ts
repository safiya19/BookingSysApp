/**
 * Booking rules shared by every branch and every service.
 *
 * Titans Bank uses one standard set of trading hours, one slot length and one
 * consultant headcount across the whole network, so these live in a single
 * place rather than in the database. Changing a value here changes it for
 * every branch.
 */

/** ISO weekday numbers, as returned by Luxon / ISO 8601: 1 = Monday … 7 = Sunday. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TradingHours {
  /** Opening time in 24h "HH:mm", branch local time. */
  opens: string;
  /** Closing time in 24h "HH:mm". The last slot must end by this time. */
  closes: string;
}

export const BOOKING_RULES = {
  /** All branches are in South Africa, which has no daylight saving. */
  timezone: 'Africa/Johannesburg',

  /** Length of every appointment slot, in minutes. */
  slotLengthMinutes: 30,

  /** Consultants available per service, per branch, per slot. */
  consultantsPerService: 5,

  /** How far ahead customers may book, in days. */
  bookingWindowDays: 30,

  /** Minimum notice before a slot, in minutes, so branches can prepare. */
  minimumNoticeMinutes: 60,

  /** Standard trading hours. Days not listed (Sunday) are closed. */
  tradingHours: {
    1: { opens: '09:00', closes: '15:00' },
    2: { opens: '09:00', closes: '15:00' },
    3: { opens: '09:00', closes: '15:00' },
    4: { opens: '09:00', closes: '15:00' },
    5: { opens: '09:00', closes: '15:00' },
    6: { opens: '09:00', closes: '13:00' },
  } as Partial<Record<IsoWeekday, TradingHours>>,
} as const;
