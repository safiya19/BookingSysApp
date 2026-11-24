import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'book' },
  {
    path: 'book',
    title: 'Book an appointment | Titans Bank',
    loadComponent: () => import('./features/booking/booking-page').then((m) => m.BookingPage),
  },
  {
    path: 'manage',
    title: 'Manage a booking | Titans Bank',
    loadComponent: () =>
      import('./features/manage-booking/manage-booking-page').then((m) => m.ManageBookingPage),
  },
  {
    path: '**',
    title: 'Page not found | Titans Bank',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
