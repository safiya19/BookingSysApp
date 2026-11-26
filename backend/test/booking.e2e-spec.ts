import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { Appointment } from '../src/booking/appointment.entity.js';
import { configureApp } from '../src/app.setup.js';
import {
  addDays,
  dateAndTime,
  isPublicHoliday,
} from '../src/booking/booking-rules.js';

/** The first Tuesday at least two days from now that is not a public holiday, so every slot is bookable. */
function upcomingTuesday(): string {
  let date = addDays(dateAndTime(new Date()).date, 2);
  while (
    new Date(`${date}T00:00:00Z`).getUTCDay() !== 2 ||
    isPublicHoliday(date)
  )
    date = addDays(date, 1);
  return date;
}

describe('Booking API', () => {
  let app: INestApplication;
  const date = upcomingTuesday();
  const http = () => request(app.getHttpServer());

  const booking = (overrides: Record<string, unknown> = {}) => ({
    serviceCode: 'FOREX',
    branchId: 3,
    date,
    time: '09:00',
    firstName: 'Thandi',
    lastName: 'Nkosi',
    email: 'thandi@example.com',
    mobile: '082 123 4567',
    popiaConsent: true,
    ...overrides,
  });

  const timesAt = async (branchId: number) =>
    (
      await http()
        .get('/api/availability')
        .query({ branchId, date })
        .expect(200)
    ).body.times;

  beforeAll(async () => {
    process.env.DATABASE_PATH = ':memory:';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  it('lists the four services', async () => {
    const res = await http().get('/api/services').expect(200);
    expect(res.body.map((s: { name: string }) => s.name)).toEqual([
      'Customer Service',
      'Collections',
      'Forex',
      'Accounts & Lending',
    ]);
  });

  it('lists 13 branches across the 9 provinces', async () => {
    const res = await http().get('/api/branches').expect(200);
    expect(res.body).toHaveLength(9);
    expect(
      res.body.flatMap((p: { branches: unknown[] }) => p.branches),
    ).toHaveLength(13);
  });

  it('lists the public holidays for the calendar', async () => {
    const res = await http().get('/api/holidays').expect(200);
    expect(res.body).toContainEqual({
      date: '2026-12-25',
      name: 'Christmas Day',
    });
  });

  it('books an appointment and returns the confirmation', async () => {
    const res = await http()
      .post('/api/appointments')
      .send(booking({ time: '10:00' }))
      .expect(201);

    expect(res.body.reference).toMatch(/^TB-[2-9A-HJ-NP-Z]{6}$/);
    expect(res.body).toMatchObject({
      service: { code: 'FOREX', name: 'Forex' },
      branchName: 'Sandton',
      date,
      time: '10:00',
      customer: {
        firstName: 'Thandi',
        email: 'thandi@example.com',
        mobile: '0821234567',
      },
    });
    expect(res.body.message).toContain(res.body.reference);
  });

  it('saves an optional passport number of any length', async () => {
    const passportNumber = 'A1234567-LONG-PASSPORT-NUMBER';
    const res = await http()
      .post('/api/appointments')
      .send(booking({ time: '13:00', passportNumber: `  ${passportNumber} ` }))
      .expect(201);

    const saved = await app
      .get<Repository<Appointment>>(getRepositoryToken(Appointment))
      .findOneByOrFail({ reference: res.body.reference });
    expect(saved.passportNumber).toBe(passportNumber);
  });

  it('removes a time once it has been booked 3 times, across all services', async () => {
    expect(await timesAt(4)).toContain('11:00');

    for (const serviceCode of ['FOREX', 'COLLECTIONS', 'CUSTOMER_SERVICE']) {
      await http()
        .post('/api/appointments')
        .send(booking({ branchId: 4, time: '11:00', serviceCode }))
        .expect(201);
    }

    expect(await timesAt(4)).not.toContain('11:00');
    await http()
      .post('/api/appointments')
      .send(booking({ branchId: 4, time: '11:00' }))
      .expect(409);
    // Other branches are not affected.
    expect(await timesAt(5)).toContain('11:00');
  });

  it('never overbooks when many people book the same time at once', async () => {
    const attempts = await Promise.all(
      Array.from({ length: 6 }, () =>
        http()
          .post('/api/appointments')
          .send(booking({ branchId: 6, time: '12:00' })),
      ),
    );
    const statuses = attempts.map((r) => r.status).sort((a, b) => a - b);
    expect(statuses).toEqual([201, 201, 201, 409, 409, 409]);
  });

  it('rejects a time outside trading hours', async () => {
    await http()
      .post('/api/appointments')
      .send(booking({ time: '16:00' }))
      .expect(400);
  });

  it('rejects missing POPIA consent and invalid details', async () => {
    const res = await http()
      .post('/api/appointments')
      .send(
        booking({
          popiaConsent: false,
          email: 'not-an-email',
          mobile: '123',
          idNumber: '12345',
        }),
      )
      .expect(400);
    expect(res.body.message.join(' ')).toContain('popiaConsent');
    expect(res.body.message).toHaveLength(4);
  });

  it('rejects an unknown branch', async () => {
    await http()
      .get('/api/availability')
      .query({ branchId: 99, date })
      .expect(400);
  });
});
