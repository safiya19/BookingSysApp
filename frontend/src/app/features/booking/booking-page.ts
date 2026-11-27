import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { finalize } from 'rxjs';
import {
  BankService,
  BookingConfirmation,
  BookingRequest,
  Branch,
  CustomerDetails,
} from '../../core/booking.models';
import { ConfirmationDialog } from './confirmation-dialog/confirmation-dialog';
import { BranchStep } from './steps/branch-step/branch-step';
import { DateTimeStep } from './steps/date-time-step/date-time-step';
import { DetailsStep } from './steps/details-step/details-step';
import { ReviewStep } from './steps/review-step/review-step';
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
  imports: [
    MatStepperModule,
    MatButtonModule,
    ServiceStep,
    BranchStep,
    DateTimeStep,
    DetailsStep,
    ReviewStep,
  ],
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

  // details is filled in by DetailsStep, to be used in the final review and confirmation step.
  // null until the form is valid/filled, then it holds the cleaned-up details.
  protected readonly details = signal<CustomerDetails | null>(null);

  // Sending the booking to the API, and showing the confirmation or an error message.
  private readonly http = inject(HttpClient);
  protected readonly submitting = signal(false); // true while waiting for the API
  protected readonly bookingError = signal<string | null>(null);
  protected readonly confirmation = signal<BookingConfirmation | null>(null);

  // Starting over: the template rebuilds the stepper (and every step's form) when this changes.
  private readonly dialog = inject(MatDialog);
  protected readonly bookingRound = signal(1);

  /** The API saves the booking, which takes one of the slot's 3 places. */
  protected confirm() {
    const service = this.service();
    const branch = this.branch();
    const date = this.date();
    const time = this.time();
    const details = this.details();
    if (!service || !branch || !date || !time || !details) return;

    const request: BookingRequest = {
      serviceCode: service.code,
      branchId: branch.id,
      date,
      time,
      ...details,
    };

    this.submitting.set(true);
    this.bookingError.set(null);
    this.http
      .post<BookingConfirmation>('/api/appointments', request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (confirmation) => this.showConfirmation(confirmation),
        error: (error: HttpErrorResponse) => this.bookingError.set(this.messageFor(error)),
      });
  }

  /** Confirmation dialog/popup  */
  private showConfirmation(confirmation: BookingConfirmation) {
    this.confirmation.set(confirmation);
    this.dialog
      .open(ConfirmationDialog, { data: confirmation, width: '480px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(() => this.startOver());
  }

  /** Clears every choice and rebuilds the stepper , so it is back at step 1 with empty forms. */
  private startOver() {
    this.service.set(null);
    this.branch.set(null); // also clears the date and time (linkedSignal)
    this.details.set(null);
    this.bookingError.set(null);
    this.confirmation.set(null);
    this.bookingRound.update((round) => round + 1);
  }

  /** A message the customer can act on, for each way booking can fail. */
  private messageFor(error: HttpErrorResponse): string {
    // STATUS CODE 409: someone else took the last place before this customer, while the customer was filling in details.
    // choosing the date reloads the free times again
    if (error.status === 409) {
      this.date.set(null);
      return 'This time slot has just been fully booked. Please go back to Date & time and choose another time.';
    }
    // STATUS CODE 400 with a message: e.g. the time slot passed while the customer was on this page.
    if (error.status === 400 && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    // Backend unreachable, or an unexpected server error.
    return "We couldn't complete your booking. Please try again.";
  }
}
