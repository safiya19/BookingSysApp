import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BRANCHES, PROVINCES, SERVICES } from '../catalogue/catalogue.js';
import {
  dateAndTime,
  publicHolidays,
  TRADING_HOURS_TEXT,
} from './booking-rules.js';
import { AvailabilityQuery, CreateAppointmentDto } from './booking.dto.js';
import { BookingService } from './booking.service.js';

@ApiTags('Booking')
@Controller()
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  /** Services customers can book. Every branch offers all of them. */
  @Get('services')
  services() {
    return SERVICES;
  }

  /** All branches, grouped by province, with trading hours. */
  @Get('branches')
  branches() {
    return PROVINCES.map((province) => ({
      province,
      branches: BRANCHES.filter((b) => b.province === province).map((b) => ({
        ...b,
        tradingHours: TRADING_HOURS_TEXT,
      })),
    }));
  }

  /**
   * Public holidays, when every branch is closed. That
   * always covers the 30-day booking window. The calendar greys these out.
   */
  @Get('holidays')
  holidays() {
    const year = Number(dateAndTime(new Date()).date.slice(0, 4));
    const holidays = { ...publicHolidays(year), ...publicHolidays(year + 1) };
    return Object.entries(holidays)
      .map(([date, name]) => ({ date, name }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Times still free at a branch on a date. Fully booked times are left out. */
  @Get('availability')
  async availability(@Query() query: AvailabilityQuery) {
    return {
      branchId: query.branchId,
      date: query.date,
      times: await this.booking.availableTimes(query.branchId, query.date),
    };
  }

  /** Book an appointment. Returns the details for the confirmation pop-up. */
  @Post('appointments')
  book(@Body() dto: CreateAppointmentDto) {
    return this.booking.book(dto);
  }

  /** For Docker health checks. */
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
