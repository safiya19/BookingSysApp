import { slotTimes } from './booking-rules.js';
import { DEMO_CUSTOMERS, upcomingOpenDays } from './demo-appointments.js';

/** DESCRIPTION
 *  This script is used to create dummy data in the database. 
 * It includes functions for validating SA ID numbers and determining 
 * available booking slots. */
function luhnValid(id: string): boolean {
  let sum = 0;
  id.split('').reverse().forEach((char, i) => {
    let digit = Number(char);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  });
  return sum % 10 === 0;
}

describe('demo appointments', () => {
  const ids = DEMO_CUSTOMERS.map((c) => c.idNumber).filter(
    (id): id is string => id !== null,
  );

  it('uses SA ID numbers that start with real birth dates', () => {
    for (const id of ids) {
      const year = 1900 + Number(id.slice(0, 2));
      const month = Number(id.slice(2, 4));
      const day = Number(id.slice(4, 6));
      // A date like 31 February rolls over into March, so it would not match.
      const date = new Date(Date.UTC(year, month - 1, day));
      expect([
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
      ]).toEqual([year, month, day]);
    }
  });

  it('uses SA ID numbers with a valid check digit', () => {
    for (const id of ids) {
      expect(id).toMatch(/^\d{13}$/);
      expect(luhnValid(id)).toBe(true);
    }
  });

  it('books them on upcoming open days only', () => {
    // Thursday 24 Dec 2026: Christmas (Fri), Day of Goodwill (Sat) and Sunday are skipped.
    const now = new Date('2026-12-24T08:00:00+02:00');
    expect(upcomingOpenDays(now, 3)).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
    ]);
    for (const day of upcomingOpenDays(now, 5)) {
      expect(slotTimes(day, now).length).toBeGreaterThan(0);
    }
  });
});
