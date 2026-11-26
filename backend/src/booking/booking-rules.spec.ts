import {
  formatAppointment,
  slotTimes,
  dateAndTime,
} from './booking-rules.js';

// Monday 30 November 2026, 10:15.
const NOW = new Date('2026-11-30T08:15:00Z');

describe('booking rules', () => {
  it('converts UTC to South African time', () => {
    expect(dateAndTime(NOW)).toEqual({ date: '2026-11-30', time: '10:15' });
    expect(dateAndTime(new Date('2026-11-30T23:00:00Z'))).toEqual({
      date: '2026-12-01',
      time: '01:00',
    });
  });

  it('offers 30-minute slots from 09:00 to 14:30 on weekdays', () => {
    const times = slotTimes('2026-12-01', NOW);
    expect(times).toHaveLength(12);
    expect(times[0]).toBe('09:00');
    expect(times[1]).toBe('09:30');
    expect(times.at(-1)).toBe('14:30');
  });

  it('offers slots from 09:00 to 12:30 on Saturdays', () => {
    const times = slotTimes('2026-12-05', NOW);
    expect(times).toHaveLength(8);
    expect(times.at(-1)).toBe('12:30');
  });

  it('is closed on Sundays', () => {
    expect(slotTimes('2026-12-06', NOW)).toEqual([]);
  });

  it('only offers times later today that have not started', () => {
    expect(slotTimes('2026-11-30', NOW)[0]).toBe('10:30');
  });

  it('allows booking up to 30 days ahead, but not in the past', () => {
    expect(slotTimes('2026-11-27', NOW)).toEqual([]);
    expect(slotTimes('2026-12-30', NOW)).toHaveLength(12);
    expect(slotTimes('2026-12-31', NOW)).toEqual([]);
  });

  it('formats an appointment for the customer', () => {
    expect(formatAppointment('2026-12-01', '09:30')).toBe(
      'Tue, 01 Dec 2026 at 09:30',
    );
  });
});
