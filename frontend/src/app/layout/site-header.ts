import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** The blue menu bar with the Titans Bank name and main links. */
@Component({
  selector: 'app-site-header',
  imports: [MatToolbarModule, RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {}
