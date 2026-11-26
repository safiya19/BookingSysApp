import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

/**
 * DESCRPTION: Booking page component.
 * This component is the main entry point for the booking flow. It uses a stepper
 * to guide the user through the booking process.
 * The booking flow is as follows: service, branch, date and time,
 * details, then review and confirm.
 */
@Component({
  selector: 'app-booking-page',
  imports: [MatStepperModule, MatButtonModule],
  templateUrl: './booking-page.html',
  styleUrls: ['../page.scss', './booking-page.scss'],
})
export class BookingPage {}
