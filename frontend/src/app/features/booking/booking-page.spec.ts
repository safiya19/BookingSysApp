import { TestBed } from '@angular/core/testing';
import { BookingPage } from './booking-page';

describe('BookingPage', () => {
  it('shows the five booking steps in order', async () => {
    const fixture = TestBed.createComponent(BookingPage);
    await fixture.whenStable();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.mat-step-label'),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['Service', 'Branch', 'Date & time', 'Your details', 'Confirm']);
  });

  it('keeps showing step numbers 1 to 5 after moving forward', async () => {
    const fixture = TestBed.createComponent(BookingPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    // Click Next on the first two steps.
    for (let step = 0; step < 2; step++) {
      const next = page.querySelectorAll<HTMLButtonElement>('button[matStepperNext]')[step];
      next.click();
      await fixture.whenStable();
    }

    const icons = Array.from(page.querySelectorAll('.mat-step-icon')).map((el) =>
      el.textContent?.trim(),
    );
    expect(icons).toEqual(['1', '2', '3', '4', '5']);
  });
});
