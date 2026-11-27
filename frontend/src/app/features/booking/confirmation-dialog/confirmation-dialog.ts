import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { BookingConfirmation } from '../../../core/booking.models';

/**
 * Pop-up shown once a booking is saved 
 * Confirmation consists of he reference, the appointment and the
 * confirmation message from the API.
 */
@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule, DatePipe],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
  // The API's reply, passed in by the booking page when it opens the dialog.
  protected readonly booking = inject<BookingConfirmation>(MAT_DIALOG_DATA);
}
