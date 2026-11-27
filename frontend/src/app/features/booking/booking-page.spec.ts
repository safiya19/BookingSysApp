import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // No open/close animations, so the pop-up opens and closes straight away in tests.
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
      ],
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

  describe('confirming the booking', () => {
    // Fills in every choice directly, as if the customer had completed steps 1 to 4.
    async function readyToConfirm() {
      const ctx = await setup();
      const booking = ctx.fixture.componentInstance;
      booking['service'].set(TEST_SERVICES[0]);
      booking['branch'].set(TEST_BRANCHES[0].branches[0]);
      booking['date'].set('2026-12-01');
      booking['time'].set('10:00');
      booking['details'].set({
        firstName: 'Thandi',
        lastName: 'Nkosi',
        email: 'thandi@example.com',
        mobile: '0821234567',
        popiaConsent: true,
      });
      // The Date & time step asks for that day's free times; answer it so the page settles.
      ctx.fixture.detectChanges();
      http
        .expectOne((r) => r.url === '/api/availability')
        .flush({ branchId: 3, date: '2026-12-01', times: ['10:00'] });
      await ctx.fixture.whenStable();
      const confirmButton = () =>
        Array.from(ctx.page.querySelectorAll('button')).find((b) =>
          /Confirm booking|Booking…/.test(b.textContent ?? ''),
        )!;
      return { ...ctx, booking, confirmButton };
    }

    it('sends the booking, shows the confirmation pop-up, and starts over when Done is pressed', async () => {
      const { fixture, page, booking, confirmButton } = await readyToConfirm();
      confirmButton().click();
      fixture.detectChanges(); // (whenStable would wait for the reply)

      // While waiting: the button can't be pressed again.
      expect(confirmButton().disabled).toBe(true);
      expect(confirmButton().textContent?.trim()).toBe('Booking…');

      const req = http.expectOne('/api/appointments');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        serviceCode: 'FOREX',
        branchId: 3,
        date: '2026-12-01',
        time: '10:00',
        firstName: 'Thandi',
        lastName: 'Nkosi',
        email: 'thandi@example.com',
        mobile: '0821234567',
        popiaConsent: true,
      });
      req.flush({
        reference: 'TB-7K3P9Q',
        service: TEST_SERVICES[0],
        branchName: 'Sandton',
        date: '2026-12-01',
        time: '10:00',
        customer: { firstName: 'Thandi', lastName: 'Nkosi', email: 'thandi@example.com', mobile: '0821234567' },
        message: 'Titans Bank: … Ref TB-7K3P9Q.',
      });
      await fixture.whenStable();

      // The pop-up opens on top of the page (outside the component, in an overlay).
      const dialog = () => document.querySelector('app-confirmation-dialog');
      expect(dialog()?.querySelector('.reference')?.textContent).toBe('TB-7K3P9Q');
      expect(confirmButton().disabled).toBe(true); // can't book the same thing twice

      // Done: the pop-up closes and the page starts a fresh booking at step 1.
      dialog()!.querySelector<HTMLButtonElement>('button')!.click();
      await new Promise((resolve) => setTimeout(resolve)); // the pop-up finishes closing
      fixture.detectChanges();

      // The rebuilt steps load their lists again (answered before waiting for the page to settle).
      http.expectOne('/api/services').flush(TEST_SERVICES);
      http.expectOne('/api/branches').flush(TEST_BRANCHES);
      http.expectOne('/api/holidays').flush([]);
      await fixture.whenStable();
      expect(dialog()).toBeNull();

      expect(booking['service']()).toBeNull();
      expect(booking['time']()).toBeNull();
      expect(booking['details']()).toBeNull();
      expect(page.querySelector('.mat-step-header[aria-selected="true"]')?.textContent).toContain('Service');
      expect(page.querySelector<HTMLInputElement>('input[formControlName="firstName"]')?.value).toBe('');
    });

    it('clears the time and explains, when the slot fills up first', async () => {
      const { fixture, page, booking, confirmButton } = await readyToConfirm();
      confirmButton().click();
      http
        .expectOne('/api/appointments')
        .flush({ message: 'Fully booked' }, { status: 409, statusText: 'Conflict' });
      await fixture.whenStable();

      expect(page.querySelector('.booking-error')?.textContent).toContain('just been fully booked');
      expect(booking['date']()).toBeNull();
      expect(booking['time']()).toBeNull();
      expect(confirmButton().disabled).toBe(true); // until a new time is chosen
    });

    it('asks the customer to try again when the backend cannot be reached', async () => {
      const { fixture, page, booking, confirmButton } = await readyToConfirm();
      confirmButton().click();
      http.expectOne('/api/appointments').error(new ProgressEvent('error'));
      await fixture.whenStable();

      expect(page.querySelector('.booking-error')?.textContent).toContain('Please try again');
      expect(booking['time']()).toBe('10:00'); // choices kept, so they can just press again
      expect(confirmButton().disabled).toBe(false);
    });
  });
});
