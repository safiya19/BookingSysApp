import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'node:crypto';
import type { Repository } from 'typeorm';
import { findBranch, findService } from '../catalogue/catalogue.js';
import { Appointment } from './appointment.entity.js';
import {
  BOOKINGS_PER_SLOT,
  formatAppointment,
  slotTimes,
} from './booking-rules.js';
import type { CreateAppointmentDto } from './booking.dto.js';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointments: Repository<Appointment>,
  ) {}

  /** Times on this date that still have a free place at the branch. */
  async availableTimes(branchId: number, date: string): Promise<string[]> {
    const times = slotTimes(date, new Date());
    if (times.length === 0) return [];

    const booked = await this.appointments.find({
      select: { time: true },
      where: { branchId, date },
    });
    const countAt = (time: string) =>
      booked.filter((b) => b.time === time).length;
    return times.filter((time) => countAt(time) < BOOKINGS_PER_SLOT);
  }

  async book(dto: CreateAppointmentDto) {
    if (!slotTimes(dto.date, new Date()).includes(dto.time)) {
      throw new BadRequestException(
        'That time is not open for booking. Please choose another time.',
      );
    }

    const reference = await this.newReference();

    // The capacity check and the insert are one SQL statement, so two people
    // booking the last place at the same moment can't both get it. If the slot
    // was already full, nothing is inserted.
    await this.appointments.query(
      `INSERT INTO appointments
         (reference, serviceCode, branchId, date, time, firstName, lastName, email, mobile, idNumber, passportNumber)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
       WHERE (SELECT COUNT(*) FROM appointments WHERE branchId = ? AND date = ? AND time = ?) < ?`,
      [
        reference,
        dto.serviceCode,
        dto.branchId,
        dto.date,
        dto.time,
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.mobile,
        dto.idNumber ?? null,
        dto.passportNumber ?? null,
        dto.branchId,
        dto.date,
        dto.time,
        BOOKINGS_PER_SLOT,
      ],
    );
    if (!(await this.appointments.existsBy({ reference }))) {
      throw new ConflictException(
        'Sorry, that time is now fully booked. Please choose another time.',
      );
    }

    const confirmation = this.confirmation(reference, dto);
    this.logger.log(
      `Booked ${reference} at ${confirmation.branchName} on ${dto.date} ${dto.time}`,
    );
    return confirmation;
  }

  /** What the customer sees in the confirmation pop-up. No SMS or email is really sent. */
  private confirmation(reference: string, dto: CreateAppointmentDto) {
    const branch = findBranch(dto.branchId)!;
    const service = findService(dto.serviceCode)!;
    const when = formatAppointment(dto.date, dto.time);
    return {
      reference,
      service,
      branchName: branch.name,
      date: dto.date,
      time: dto.time,
      customer: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        mobile: dto.mobile,
      },
      message:
        `Dear ${dto.firstName} ${dto.lastName}, your ${service.name} appointment at ${branch.name} ` +
        `branch is confirmed for ${when}. Please bring your ID or passport. Ref ${reference}.`,
    };
  }

  /** Random reference such as "TB-7K3P9Q", without 0/O or 1/I, which are easy to confuse. */
  private async newReference(): Promise<string> {
    const letters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (;;) {
      let code = 'TB-';
      for (let i = 0; i < 6; i++) code += letters[randomInt(letters.length)];
      if (!(await this.appointments.existsBy({ reference: code }))) return code;
    }
  }
}
