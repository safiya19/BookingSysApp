import { TestBed } from '@angular/core/testing';
import { CustomerDetails } from '../../../../core/booking.models';
import { ReviewStep } from './review-step';

const DETAILS: CustomerDetails = {
  firstName: 'Thandi',
  lastName: 'Nkosi',
  email: 'thandi@example.com',
  mobile: '0821234567',
  popiaConsent: true,
};

describe('ReviewStep', () => {
  async function setup(details: CustomerDetails = DETAILS) {
    const fixture = TestBed.createComponent(ReviewStep);
    fixture.componentRef.setInput('service', { code: 'FOREX', name: 'Forex', description: '' });
    fixture.componentRef.setInput('branch', {
      id: 3,
      name: 'Sandton',
      province: 'Gauteng',
      city: 'Johannesburg',
      tradingHours: '',
    });
    fixture.componentRef.setInput('date', '2026-12-01');
    fixture.componentRef.setInput('time', '10:00');
    fixture.componentRef.setInput('details', details);
    await fixture.whenStable();

    // { label: value } for every row shown.
    const page = fixture.nativeElement as HTMLElement;
    const rows = Object.fromEntries(
      Array.from(page.querySelectorAll('.row')).map((row) => [
        row.querySelector('dt')?.textContent?.trim(),
        row.querySelector('dd')?.textContent?.trim(),
      ]),
    );
    return { rows };
  }

  it('summarises the whole booking in a readable form', async () => {
    const { rows } = await setup();
    expect(rows).toEqual({
      Service: 'Forex',
      Branch: 'Sandton, Johannesburg',
      'Date & time': 'Tue, 01 Dec 2026 at 10:00',
      Name: 'Thandi Nkosi',
      Email: 'thandi@example.com',
      Cell: '082 123 4567',
    });
  });

  it('shows the ID and passport numbers only when they were given', async () => {
    const { rows } = await setup({ ...DETAILS, idNumber: '9001015009087', passportNumber: 'A1234567' });
    expect(rows['SA ID number']).toBe('9001015009087');
    expect(rows['Passport number']).toBe('A1234567');
  });
});
