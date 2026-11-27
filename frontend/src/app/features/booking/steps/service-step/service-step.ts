import { httpResource } from '@angular/common/http';
import { Component, computed, model } from '@angular/core';
import { BankService } from '../../../../core/booking.models';

/**
 * Booking step 1: choose one of the bank's services, shown as cards.
 * The chosen service is shared with the booking page through [(selected)].
 */
@Component({
  selector: 'app-service-step',
  templateUrl: './service-step.html',
  styleUrls: ['../choice-cards.scss', './service-step.scss'],
})
export class ServiceStep {
  /** The chosen service, or null until the customer picks one. */
  readonly selected = model<BankService | null>(null);

  /** Loads the services as soon as the step is shown. */
  private readonly services = httpResource<BankService[]>(() => '/api/services');

  /**
   * The services to show. Empty while loading or if the request fails, because
   * reading services.value() after a failed request would throw an error.
   */
  protected readonly serviceList = computed(() =>
    this.services.hasValue() ? this.services.value() : [],
  );
}
