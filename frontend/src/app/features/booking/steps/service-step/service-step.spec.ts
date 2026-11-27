import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BankService } from '../../../../core/booking.models';
import { ServiceStep } from './service-step';

const TEST_SERVICES: BankService[] = [
  { code: 'CUSTOMER_SERVICE', name: 'Customer Service', description: 'General enquiries.' },
  { code: 'FOREX', name: 'Forex', description: 'Foreign exchange.' },
];

describe('ServiceStep', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function setup() {
    const fixture = TestBed.createComponent(ServiceStep);
    const page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // render and send the services request
    return { fixture, page };
  }

  it('shows each service as a card with its description', async () => {
    const { fixture, page } = await setup();
    http.expectOne('/api/services').flush(TEST_SERVICES);
    await fixture.whenStable();

    const names = Array.from(page.querySelectorAll('.card .name')).map((el) => el.textContent);
    expect(names).toEqual(['Customer Service', 'Forex']);
    expect(page.querySelector('.card .description')?.textContent).toBe('General enquiries.');
  });

  it('remembers the service the customer clicks', async () => {
    const { fixture, page } = await setup();
    http.expectOne('/api/services').flush(TEST_SERVICES);
    await fixture.whenStable();

    page.querySelectorAll<HTMLInputElement>('.card input')[1].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.selected()?.code).toBe('FOREX');
    expect(page.querySelector('.card.selected .name')?.textContent).toBe('Forex');
  });

  it('shows no cards, and does not crash, when the services cannot be loaded', async () => {
    const { fixture, page } = await setup();
    http.expectOne('/api/services').flush('Down', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(page.querySelectorAll('.card')).toHaveLength(0);
    expect(page.querySelector('.step-title')).not.toBeNull();
  });
});
