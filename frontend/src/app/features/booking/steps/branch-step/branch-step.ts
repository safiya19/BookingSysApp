import { httpResource } from '@angular/common/http';
import { Component, computed, model, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Branch, ProvinceBranches } from '../../../../core/booking.models';

/**
 * Step 2: the customer picks a province, then a branch in that province.
 * The chosen branch is shared with the booking page through `selected`.
 */
@Component({
  selector: 'app-branch-step',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './branch-step.html',
  styleUrl: './branch-step.scss',
})
export class BranchStep {
  readonly selected = model<Branch | null>(null);

  private readonly branches = httpResource<ProvinceBranches[]>(() => '/api/branches');

  // The list of provinces with branches for the dropdown
  protected readonly provinceList = computed(() =>
    this.branches.hasValue() ? this.branches.value() : [],
  );

  protected readonly province = signal('');

  // Branches in the chosen province.
  protected readonly branchList = computed(
    () => this.provinceList().find((p) => p.province === this.province())?.branches ?? [],
  );

  // When selecting a new province, the branch selection clears.
  protected chooseProvince(province: string) {
    this.province.set(province);
    this.selected.set(null);
  }

  // The dropdown gives back the branch id
  protected chooseBranch(id: string) {
    this.selected.set(this.branchList().find((b) => b.id === Number(id)) ?? null);
  }
}
