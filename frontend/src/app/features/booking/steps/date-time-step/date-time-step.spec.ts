import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Branch, PublicHoliday } from '../../../../core/booking.models';
import { DateTimeStep, isOpenDay, toIsoDate } from './date-time-step';

const SANDTON: Branch = {
  id: 3,
  name: 'Sandton',
  province: 'Gauteng',
  city: 'Johannesburg',
  tradingHours: 'Mon–Fri 09:00–15:00, Sat 09:00–13:00, closed Sundays',
};

describe('DateTimeStep', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function setup(holidays: PublicHoliday[] = []) {
    const fixture = TestBed.createComponent(DateTimeStep);
    fixture.componentRef.setInput('branch', SANDTON);
    const page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // render and send the holidays request
    http.expectOne('/api/holidays').flush(holidays);
    await fixture.whenStable();

    // Clicks the first day that can be booked (moving to next month if needed).
    const chooseFirstOpenDay = async () => {
      const openDay = () =>
        page.querySelector<HTMLElement>('.mat-calendar-body-cell:not(.mat-calendar-body-disabled)');
      if (!openDay()) {
        page.querySelector<HTMLButtonElement>('.mat-calendar-next-button')!.click();
        await fixture.whenStable();
      }
      openDay()!.click();
      fixture.detectChanges(); // send the availability request
    };
    const timeLabels = () =>
      Array.from(page.querySelectorAll('.time')).map((el) => el.textContent?.trim());
    return { fixture, page, chooseFirstOpenDay, timeLabels };
  }

  it("shows the branch's trading hours and asks for no times until a date is chosen", async () => {
    const { page } = await setup();
    expect(page.querySelector('.hours')?.textContent).toContain('Sandton trading hours:');
    expect(page.querySelector('.hours')?.textContent).toContain('closed Sundays');
    http.expectNone((req) => req.url === '/api/availability');
  });

  it('loads the free times for the chosen date and remembers the time clicked', async () => {
    const { fixture, page, chooseFirstOpenDay, timeLabels } = await setup();
    await chooseFirstOpenDay();

    const date = fixture.componentInstance.date()!;
    const req = http.expectOne((r) => r.url === '/api/availability');
    expect(req.request.params.get('branchId')).toBe('3');
    expect(req.request.params.get('date')).toBe(date);
    req.flush({ branchId: 3, date, times: ['09:00', '09:30', '10:00'] });
    await fixture.whenStable();

    expect(timeLabels()).toEqual(['09:00', '09:30', '10:00']);
    page.querySelectorAll<HTMLInputElement>('.time input')[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.time()).toBe('09:30');
    expect(page.querySelector('.time.selected')?.textContent?.trim()).toBe('09:30');
  });

  it('says so when the chosen date is fully booked', async () => {
    const { fixture, page, chooseFirstOpenDay, timeLabels } = await setup();
    await chooseFirstOpenDay();

    const date = fixture.componentInstance.date()!;
    http.expectOne((r) => r.url === '/api/availability').flush({ branchId: 3, date, times: [] });
    await fixture.whenStable();

    expect(timeLabels()).toEqual([]);
    expect(page.querySelector('.note')?.textContent).toContain('No times are available');
  });

  it('greys out public holidays from the API', async () => {
    const { fixture } = await setup([{ date: '2026-12-25', name: 'Christmas Day' }]);
    // canBook is the calendar's day filter (protected, so reached by name).
    const canBook = fixture.componentInstance['canBook']();
    expect(canBook(new Date(2026, 11, 25))).toBe(false); // Christmas (Friday)
    expect(canBook(new Date(2026, 11, 24))).toBe(true); // ordinary Thursday
  });

  it('treats Sundays as closed and formats dates as YYYY-MM-DD', () => {
    expect(isOpenDay(new Date(2026, 10, 29))).toBe(false); // Sunday 29 Nov 2026
    expect(isOpenDay(new Date(2026, 10, 30))).toBe(true); // Monday
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
