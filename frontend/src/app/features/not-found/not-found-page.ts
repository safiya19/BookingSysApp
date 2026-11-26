import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
/** Still to determine if this page is needed, but it is a good idea to have a 404 page in case the user navigates to a non-existent route. */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <h1>This page doesn't exist</h1>
    <p class="lead">Check the address, or <a routerLink="/book">book an appointment</a>.</p>
  `,
  styleUrl: '../page.scss',
})
export class NotFoundPage {}
