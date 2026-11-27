import { Component, inject, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomerDetails } from '../../../../core/booking.models';

// The same rules the backend checks (booking.dto.ts), so the form never sends
// something the API would reject.
const removeSpaces = (value: string) => value.replace(/\s/g, '');
const SA_CELL = /^0[6-8]\d{8}$/; // e.g. 0821234567
const SA_ID = /^\d{13}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // something@domain.tld
const NOT_BLANK = /\S/; // rejects a name that is only spaces

/** Valid if the number is a South African cellphone number, ignoring spaces. */
function saCell(control: AbstractControl<string>): ValidationErrors | null {
  return SA_CELL.test(removeSpaces(control.value)) ? null : { saCell: true };
}

/** Valid if empty (the ID number is optional) or 13 digits, ignoring spaces. */
function optionalSaId(control: AbstractControl<string>): ValidationErrors | null {
  const id = removeSpaces(control.value);
  return id === '' || SA_ID.test(id) ? null : { saId: true };
}

/**
 *  DESCRPTION: Review step component.
 * This component requires the customer to fill in their contact details and consent to POPIA.
 * The form is valid only when all required fields are filled in correctly, and the consent checkbox is checked.
 * When valid, the cleaned-up details are shared with the parent booking component for the final review and confirmation step.
 * 'details' holds the cleaned-up details 
*/
@Component({
  selector: 'app-details-step',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  templateUrl: './details-step.html',
  styleUrl: './details-step.scss',
})
export class DetailsStep {
  readonly details = model<CustomerDetails | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    firstName: ['', [Validators.required, Validators.pattern(NOT_BLANK), Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.pattern(NOT_BLANK), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL), Validators.maxLength(254)]],
    mobile: ['', [Validators.required, saCell]],
    idNumber: ['', [optionalSaId]],
    passportNumber: [''], // optional, any length, no format rules due to country differences
    popiaConsent: [false, [Validators.requiredTrue]],
  });

  constructor() {
    // Every change: share the details if the whole form is valid, otherwise null.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const v = this.form.getRawValue();
      this.details.set(
        this.form.valid
          ? {
              firstName: v.firstName.trim(),
              lastName: v.lastName.trim(),
              email: v.email.trim(),
              mobile: removeSpaces(v.mobile),
              idNumber: removeSpaces(v.idNumber) || undefined,
              passportNumber: v.passportNumber.trim() || undefined,
              popiaConsent: true,
            }
          : null,
      );
    });
  }
}
