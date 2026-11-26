import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BookingPage } from './booking-page';
import { BankService, ProvinceBranches } from '../../core/booking.models';

const TEST_SERVICES: BankService[] = [
  { code: 'FOREX', name: 'Forex', description: 'Foreign exchange.' },
];
const TEST_BRANCHES: ProvinceBranches[] = [
  {
    province: 'Gauteng',
    branches: [
      { id: 3, name: 'Sandton', province: 'Gauteng', city: 'Johannesburg', tradingHours: 'Mon–Fri' },
    ],
  },
];

describe('BookingPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function setup() {
    const fixture = TestBed.createComponent(BookingPage);
    const page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // render and send the services, branches and holidays requests
    http.expectOne('/api/services').flush(TEST_SERVICES);
    http.expectOne('/api/branches').flush(TEST_BRANCHES);
    http.expectOne('/api/holidays').flush([]);
    await fixture.whenStable();
    const nextButtons = () => page.querySelectorAll<HTMLButtonElement>('button[matStepperNext]');
    return { fixture, page, nextButtons };
  }

  it('shows the five booking steps in order', async () => {
    const { page } = await setup();
    const labels = Array.from(page.querySelectorAll('.mat-step-label')).map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual(['Service', 'Branch', 'Date & time', 'Your details', 'Confirm']);
  });

  it('only allows moving on once a service is chosen', async () => {
    const { fixture, page, nextButtons } = await setup();
    expect(nextButtons()[0].disabled).toBe(true);

    page.querySelector<HTMLInputElement>('app-service-step .card input')!.click();
    await fixture.whenStable();

    expect(nextButtons()[0].disabled).toBe(false);
  });

  it('keeps showing step numbers 1 to 5 after moving forward', async () => {
    const { fixture, page, nextButtons } = await setup();

    page.querySelector<HTMLInputElement>('app-service-step .card input')!.click();
    await fixture.whenStable();
    nextButtons()[0].click(); // Service -> Branch
    await fixture.whenStable();

    const [province, branch] = Array.from(page.querySelectorAll<HTMLSelectElement>('app-branch-step select'));
    province.value = 'Gauteng';
    province.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    branch.value = '3';
    branch.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    nextButtons()[1].click(); // Branch -> Date & time
    await fixture.whenStable();

    const icons = Array.from(page.querySelectorAll('.mat-step-icon')).map((el) =>
      el.textContent?.trim(),
    );
    expect(icons).toEqual(['1', '2', '3', '4', '5']);
  });

  it('clears the chosen date and time when the customer changes branch', async () => {
    const { fixture } = await setup();
    // The choices are protected, so the test reaches them by name.
    const booking = fixture.componentInstance;
    booking['branch'].set(TEST_BRANCHES[0].branches[0]);
    booking['date'].set('2026-12-01');
    booking['time'].set('09:30');

    booking['branch'].set({ ...TEST_BRANCHES[0].branches[0], id: 4, name: 'Menlyn' });

    expect(booking['date']()).toBeNull();
    expect(booking['time']()).toBeNull();
  });
});
