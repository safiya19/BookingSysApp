import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer>
      <p>Titans Bank is an authorised financial services provider.</p>
      <p>Need help now? Call 0800 000 000, Monday to Friday, 08:00 to 17:00.</p>
    </footer>
  `,
  styles: `
    footer {
      border-top: 1px solid var(--tb-line);
      padding: 1.5rem 1.25rem;
      color: var(--tb-muted);
      font-size: 0.875rem;
      text-align: center;
    }
    p {
      margin: 0.25rem 0;
    }
  `,
})
export class SiteFooter {}
