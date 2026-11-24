import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
