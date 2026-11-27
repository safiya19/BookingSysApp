import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookingConfirmation } from '../../../core/booking.models';
import { ConfirmationDialog } from './confirmation-dialog';

const CONFIRMATION: BookingConfirmation = {
  reference: 'TB-7K3P9Q',
  service: { code: 'FOREX', name: 'Forex', description: '' },
  branchName: 'Sandton',
  date: '2026-12-01',
  time: '10:00',
  customer: {
    firstName: 'Thandi',
    lastName: 'Nkosi',
    email: 'thandi@example.com',
    mobile: '0821234567',
  },
  message: 'Titans Bank: Dear Thandi Nkosi, your Forex appointment … Ref TB-7K3P9Q.',
};

describe('ConfirmationDialog', () => {
  it('shows the reference, the appointment and the confirmation message', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: MAT_DIALOG_DATA, useValue: CONFIRMATION }],
    });
    const fixture = TestBed.createComponent(ConfirmationDialog);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('.reference')?.textContent).toBe('TB-7K3P9Q');
    const rows = Array.from(page.querySelectorAll('.row dd')).map((el) => el.textContent?.trim());
    expect(rows).toEqual(['Forex', 'Sandton', 'Tue, 01 Dec 2026 at 10:00', 'Thandi Nkosi']);
    expect(page.querySelector('.message')?.textContent).toBe(CONFIRMATION.message);
  });
});
