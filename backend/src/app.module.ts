import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Appointment } from './booking/appointment.entity.js';
import { BookingController } from './booking/booking.controller.js';
import { BookingService } from './booking/booking.service.js';
import { DemoAppointments } from './booking/demo-appointments.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // A file path, or ":memory:" for a throwaway database (used by the tests).
        const database = process.env.DATABASE_PATH ?? 'data/titans-bank.db';
        if (database !== ':memory:')
          mkdirSync(dirname(database), { recursive: true });
        return {
          type: 'better-sqlite3',
          database,
          entities: [Appointment],
          // Creates the table on start-up. Fine for a single SQLite table; a
          // shared PostgreSQL database would use migrations instead.
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([Appointment]),
  ],
  controllers: [BookingController],
  providers: [BookingService, DemoAppointments],
})
export class AppModule {}
