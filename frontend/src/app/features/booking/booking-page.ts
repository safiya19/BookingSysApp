import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { BankService } from '../../core/booking.models';
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
  imports: [MatStepperModule, MatButtonModule, ServiceStep],
  templateUrl: './booking-page.html',
  styleUrls: ['../page.scss', './booking-page.scss'],
})
export class BookingPage {
  // The customer's choices so far. Each step fills one in.
  protected readonly service = signal<BankService | null>(null);
}
