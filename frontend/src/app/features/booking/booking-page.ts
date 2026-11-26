import { Component, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { BankService, Branch } from '../../core/booking.models';
import { BranchStep } from './steps/branch-step/branch-step';
import { DateTimeStep } from './steps/date-time-step/date-time-step';
import { ServiceStep } from './steps/service-step/service-step';

/**
 * DESCRPTION: Booking page component.
 * This component is the main entry point for the booking flow. It uses a stepper
 * to guide the user through the booking process.
 * The booking flow is as follows: service, branch, date and time,
 * details, then review and confirm.
 */
@Component({
  selector: 'app-booking-page',
  imports: [MatStepperModule, MatButtonModule, ServiceStep, BranchStep, DateTimeStep],
  templateUrl: './booking-page.html',
  styleUrls: ['../page.scss', './booking-page.scss'],
})
export class BookingPage {
  // The customer's choices so far. Each step fills one in.
  protected readonly service = signal<BankService | null>(null);
  protected readonly branch = signal<Branch | null>(null);

  // linkedSignal resets to null whenever its source changes:
  // a new branch clears the date, and a new date clears the time.
  protected readonly date = linkedSignal<Branch | null, string | null>({
    source: this.branch,
    computation: () => null,
  });
  protected readonly time = linkedSignal<string | null, string | null>({
    source: this.date,
    computation: () => null,
  });
}
