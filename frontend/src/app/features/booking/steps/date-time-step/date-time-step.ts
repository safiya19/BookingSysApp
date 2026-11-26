import { httpResource } from '@angular/common/http';
import { Component, computed, input, model } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Availability, Branch, PublicHoliday } from '../../../../core/booking.models';

// Must match BOOKING_WINDOW_DAYS in the backend's booking-rules.ts.
const BOOKING_WINDOW_DAYS = 30;

/** Branches are closed on Sundays, so the calendar greys them out. */
export const isOpenDay = (day: Date | null) => !!day && day.getDay() !== 0;

/** Calendar Date -> "YYYY-MM-DD", the format the API uses. */
export function toIsoDate(day: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
}

/** "YYYY-MM-DD" -> calendar Date (local midnight). */
function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Step 3: the customer picks a date on the calendar, then one of the free
 * times at their branch on that date.
 */
@Component({
  selector: 'app-date-time-step',
  imports: [MatDatepickerModule],
  // The calendar works with plain JavaScript Dates; en-ZA starts weeks on Monday.
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'en-ZA' }],
  templateUrl: './date-time-step.html',
  styleUrl: './date-time-step.scss',
})
export class DateTimeStep {
  readonly branch = input<Branch | null>(null);
  readonly date = model<string | null>(null);
  readonly time = model<string | null>(null);

  // Bookable range: today up to 30 days ahead.
  protected readonly firstDay = new Date(new Date().setHours(0, 0, 0, 0));
  protected readonly lastDay = new Date(
    this.firstDay.getFullYear(),
    this.firstDay.getMonth(),
    this.firstDay.getDate() + BOOKING_WINDOW_DAYS,
  );
  // Public holidays come from the API, which also refuses bookings on them.
  private readonly holidays = httpResource<PublicHoliday[]>(() => '/api/holidays');

  // The calendar's day filter: open days that aren't public holidays.
  // when the holidays arrive, the calendar redraws with those days greyed out.
  protected readonly canBook = computed(() => {
    const closed = new Set(this.holidays.hasValue() ? this.holidays.value().map((h) => h.date) : []);
    return (day: Date | null) => isOpenDay(day) && !closed.has(toIsoDate(day!));
  });

  protected readonly selectedDay = computed(() => {
    const date = this.date();
    return date ? fromIsoDate(date) : null;
  });

  // Asks the API for free times once both a branch and a date are chosen.
  private readonly availability = httpResource<Availability>(() => {
    const branch = this.branch();
    const date = this.date();
    return branch && date
      ? { url: '/api/availability', params: { branchId: branch.id, date } }
      : undefined;
  });

  protected readonly times = computed(() =>
    this.availability.hasValue() ? this.availability.value().times : [],
  );

  // Loaded, but every slot that day is taken (or has already passed).
  protected readonly fullyBooked = computed(
    () => this.availability.hasValue() && this.times().length === 0,
  );

  protected chooseDay(day: Date | null) {
    this.date.set(day ? toIsoDate(day) : null);
  }
}
