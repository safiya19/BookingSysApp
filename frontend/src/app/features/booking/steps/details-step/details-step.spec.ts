import { TestBed } from '@angular/core/testing';
import { DetailsStep } from './details-step';

describe('DetailsStep', () => {
  async function setup() {
    const fixture = TestBed.createComponent(DetailsStep);
    const page = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    // Types into a field, then leaves it (so its error can show).
    const type = async (name: string, value: string) => {
      const input = page.querySelector<HTMLInputElement>(`input[formControlName="${name}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    };
    const tickConsent = async () => {
      page.querySelector<HTMLInputElement>('.consent input[type="checkbox"]')!.click();
      await fixture.whenStable();
    };
    const fillValidForm = async () => {
      await type('firstName', '  Thandi ');
      await type('lastName', 'Nkosi');
      await type('email', 'thandi@example.com');
      await type('mobile', '082 123 4567');
      await tickConsent();
    };
    const errors = () =>
      Array.from(page.querySelectorAll('mat-error')).map((el) => el.textContent?.trim());
    return { fixture, type, tickConsent, fillValidForm, errors };
  }

  it('shares the cleaned-up details once every field is valid and consent is ticked', async () => {
    const { fixture, fillValidForm } = await setup();
    expect(fixture.componentInstance.details()).toBeNull();

    await fillValidForm();

    expect(fixture.componentInstance.details()).toEqual({
      firstName: 'Thandi',
      lastName: 'Nkosi',
      email: 'thandi@example.com',
      mobile: '0821234567',
      idNumber: undefined,
      passportNumber: undefined,
      popiaConsent: true,
    });
  });

  it('requires POPIA consent', async () => {
    const { fixture, fillValidForm, tickConsent } = await setup();
    await fillValidForm();
    await tickConsent(); // untick

    expect(fixture.componentInstance.details()).toBeNull();
  });

  it('explains an invalid mobile number or email once the customer leaves the field', async () => {
    const { fixture, fillValidForm, type, errors } = await setup();
    await fillValidForm();

    await type('mobile', '0123');
    await type('email', 'thandi@example');

    expect(fixture.componentInstance.details()).toBeNull();
    expect(errors()).toEqual([
      'Please enter a valid email address, e.g. name@example.com.',
      'Please enter a 10-digit SA mobile number, e.g. 082 123 4567.',
    ]);
  });

  it('treats the SA ID number as optional, but checks it when given', async () => {
    const { fixture, fillValidForm, type, errors } = await setup();
    await fillValidForm();

    await type('idNumber', '12345');
    expect(fixture.componentInstance.details()).toBeNull();
    expect(errors()).toEqual(['An SA ID number has 13 digits.']);

    await type('idNumber', '900101 5009 087');
    expect(fixture.componentInstance.details()?.idNumber).toBe('9001015009087');
  });

  it('accepts an optional passport number of any length', async () => {
    const { fixture, fillValidForm, type, errors } = await setup();
    await fillValidForm();

    await type('passportNumber', ' A1234567-LONG-PASSPORT-NUMBER ');

    expect(errors()).toEqual([]);
    expect(fixture.componentInstance.details()?.passportNumber).toBe('A1234567-LONG-PASSPORT-NUMBER');
  });
});
