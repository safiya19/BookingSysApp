import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  imports: [MatToolbarModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar class="bar" role="banner">
      <a class="brand" routerLink="/book" aria-label="Titans Bank home">
        <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4 12 16 4l12 8v2H4z" fill="currentColor" />
          <path d="M7 16h3v9H7zm7.5 0h3v9h-3zM22 16h3v9h-3zM4 27h24v2H4z" fill="currentColor" />
        </svg>
        <span>Titans Bank</span>
      </a>
      <nav class="nav" aria-label="Main">
        <a routerLink="/book" routerLinkActive="active" ariaCurrentWhenActive="page">
          Book an appointment
        </a>
      </nav>
    </mat-toolbar>
  `,
  styles: `
    .bar {
      background: var(--tb-blue-900);
      color: var(--tb-white);
      height: auto;
      min-height: 64px;
      padding: 0.5rem 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem 2rem;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      color: inherit;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .mark {
      width: 28px;
      height: 28px;
    }
    .nav {
      display: flex;
      gap: 0.25rem;
      margin-left: auto;
      flex-wrap: wrap;
    }
    .nav a {
      color: rgb(255 255 255 / 0.82);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
    }
    .nav a:hover {
      color: var(--tb-white);
      background: rgb(255 255 255 / 0.08);
    }
    .nav a.active {
      color: var(--tb-white);
      box-shadow: inset 0 -2px 0 var(--tb-white);
      border-radius: 0;
    }
    .bar :focus-visible {
      outline-color: var(--tb-white);
    }
  `,
})
export class SiteHeader {}
