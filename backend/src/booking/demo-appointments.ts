import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Appointment } from './appointment.entity.js';
import { addDays, dateAndTime, slotTimes } from './booking-rules.js';

/**
 * DESCRIPTION
 * Five made-up customers, so a fresh copy of the project has some bookings to look at.
 * The SA ID numbers are not real people's, but they follow the real format:
 * YYMMDD birth date, 4 digits for gender (0000–4999 female, 5000–9999 male),
 * 0 for citizen, 8, and a Luhn check digit.
 */
export const DEMO_CUSTOMERS = [
  {
    reference: 'TB-DEMO01',
    serviceCode: 'CUSTOMER_SERVICE',
    branchId: 3, // Sandton
    firstName: 'Thandiwe',
    lastName: 'Mokoena',
    email: 'thandiwe.mokoena@example.com',
    mobile: '0821234567',
    idNumber: '9203140124083', // born 14 March 1992, female
    passportNumber: null,
  },
  {
    reference: 'TB-DEMO02',
    serviceCode: 'ACCOUNTS_AND_LOANS',
    branchId: 6, // Umhlanga
    firstName: 'Sipho',
    lastName: 'Dlamini',
    email: 'sipho.dlamini@example.com',
    mobile: '0739876543',
    idNumber: '8507225631080', // born 22 July 1985, male
    passportNumber: null,
  },
  {
    reference: 'TB-DEMO03',
    serviceCode: 'FOREX',
    branchId: 12, // Cape Town CBD
    firstName: 'Ayesha',
    lastName: 'Patel',
    email: 'ayesha.patel@example.com',
    mobile: '0645551234',
    idNumber: '9811050789081', // born 5 November 1998, female
    passportNumber: null,
  },
  {
    reference: 'TB-DEMO04',
    serviceCode: 'COLLECTIONS',
    branchId: 4, // Menlyn
    firstName: 'Johan',
    lastName: 'van der Merwe',
    email: 'johan.vdmerwe@example.com',
    mobile: '0832468135',
    idNumber: '7602295123083', // born 29 February 1976 (a leap year), male
    passportNumber: null,
  },
  {
    // An international client: passport instead of an SA ID number.
    reference: 'TB-DEMO05',
    serviceCode: 'FOREX',
    branchId: 3, // Sandton
    firstName: 'Liam',
    lastName: "O'Connor",
    email: 'liam.oconnor@example.com',
    mobile: '0767890123',
    idNumber: null,
    passportNumber: 'PA4821937',
  },
];

/**
 * The next open days after today, so the demo bookings are always upcoming
 * (fixed dates would drift into the past). Skips Sundays and public holidays.
 */
export function upcomingOpenDays(now: Date, count: number): string[] {
  const { date: today } = dateAndTime(now);
  const days: string[] = [];
  for (let offset = 1; days.length < count; offset++) {
    const day = addDays(today, offset);
    if (slotTimes(day, now).length > 0) days.push(day);
  }
  return days;
}

/** On start-up, adds the demo bookings if there are no bookings yet. */
@Injectable()
export class DemoAppointments implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoAppointments.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointments: Repository<Appointment>,
  ) {}

  async onApplicationBootstrap() {
    // The tests use a throwaway in-memory database and expect it to start empty.
    if (process.env.DATABASE_PATH === ':memory:') return;
    if ((await this.appointments.count()) > 0) return;

    const now = new Date();
    const days = upcomingOpenDays(now, DEMO_CUSTOMERS.length);
    const rows = DEMO_CUSTOMERS.map((customer, i) => {
      const times = slotTimes(days[i], now);
      return { ...customer, date: days[i], time: times[i % times.length] };
    });
    await this.appointments.insert(rows);
    this.logger.log(`Added ${rows.length} demo appointments.`);
  }
}
