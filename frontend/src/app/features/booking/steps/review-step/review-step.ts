import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { BankService, Branch, CustomerDetails } from '../../../../core/booking.models';

/**
 *  DESCRPTION: Review step component.
 * This component is the final step in the booking flow
 * A read-only summary of everything the customer chose, so they can
 * check it before confirming. To change something, they go back a step.
 */
@Component({
  selector: 'app-review-step',
  imports: [DatePipe],
  templateUrl: './review-step.html',
  styleUrl: './review-step.scss',
})
export class ReviewStep {
  readonly service = input<BankService | null>(null);
  readonly branch = input<Branch | null>(null);
  readonly date = input<string | null>(null);
  readonly time = input<string | null>(null);
  readonly details = input<CustomerDetails | null>(null);

  // "0821234567" -> "082 123 4567", easier to check at a glance.
  protected readonly mobile = computed(() => {
    const m = this.details()?.mobile ?? '';
    return m.length === 10 ? `${m.slice(0, 3)} ${m.slice(3, 6)} ${m.slice(6)}` : m;
  });
}
