import { Component } from '@angular/core';

/** Booking flow: service, branch, date and time, details, confirm. Built on Wednesday. */
@Component({
  selector: 'app-booking-page',
  template: `
    <h1>Book a branch appointment</h1>
    <p class="lead">
      Choose a service, pick a branch near you and select a time that suits you.
    </p>
  `,
  styleUrl: '../page.scss',
})
export class BookingPage {}
