import {
  formatAppointment,
  easterSunday,
  isPublicHoliday,
  publicHolidays,
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

  it('is closed on public holidays, including Mondays after a Sunday holiday', () => {
    expect(slotTimes('2026-12-16', NOW)).toEqual([]); // Day of Reconciliation (Wed)
    expect(slotTimes('2026-12-26', NOW)).toEqual([]); // Day of Goodwill (Sat)
    expect(isPublicHoliday('2027-12-27')).toBe(true); // Day of Goodwill observed (Mon)
    expect(slotTimes('2026-12-17', NOW)).toHaveLength(12); // ordinary Thursday
  });

  it('calculates Easter Sunday for any year', () => {
    expect(easterSunday(2025)).toBe('2025-04-20');
    expect(easterSunday(2026)).toBe('2026-04-05');
    expect(easterSunday(2027)).toBe('2027-03-28');
    expect(easterSunday(2038)).toBe('2038-04-25'); // latest possible date
    expect(easterSunday(2285)).toBe('2285-03-22'); // earliest possible date
  });

  it('calculates the same public holidays as the official 2026 and 2027 calendars', () => {
    expect({ ...publicHolidays(2026), ...publicHolidays(2027) }).toEqual({
      '2026-01-01': "New Year's Day",
      '2026-03-21': 'Human Rights Day',
      '2026-04-03': 'Good Friday',
      '2026-04-06': 'Family Day',
      '2026-04-27': 'Freedom Day',
      '2026-05-01': "Workers' Day",
      '2026-06-16': 'Youth Day',
      '2026-08-09': "National Women's Day",
      '2026-08-10': "National Women's Day (observed)",
      '2026-09-24': 'Heritage Day',
      '2026-12-16': 'Day of Reconciliation',
      '2026-12-25': 'Christmas Day',
      '2026-12-26': 'Day of Goodwill',
      '2027-01-01': "New Year's Day",
      '2027-03-21': 'Human Rights Day',
      '2027-03-22': 'Human Rights Day (observed)',
      '2027-03-26': 'Good Friday',
      '2027-03-29': 'Family Day',
      '2027-04-27': 'Freedom Day',
      '2027-05-01': "Workers' Day",
      '2027-06-16': 'Youth Day',
      '2027-08-09': "National Women's Day",
      '2027-09-24': 'Heritage Day',
      '2027-12-16': 'Day of Reconciliation',
      '2027-12-25': 'Christmas Day',
      '2027-12-26': 'Day of Goodwill',
      '2027-12-27': 'Day of Goodwill (observed)',
    });
  });

  it('works for years with no hand-written list', () => {
    expect(isPublicHoliday('2031-04-11')).toBe(true); // Good Friday 2031
    expect(isPublicHoliday('2032-06-16')).toBe(true); // Youth Day
    expect(isPublicHoliday('2032-06-17')).toBe(false);
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
