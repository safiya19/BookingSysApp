import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProvinceBranches } from '../../../../core/booking.models';
import { BranchStep } from './branch-step';

const HOURS = 'Mon–Fri 09:00–15:00';
const TEST_BRANCHES: ProvinceBranches[] = [
  {
    province: 'Gauteng',
    branches: [
      { id: 3, name: 'Sandton', province: 'Gauteng', city: 'Johannesburg', tradingHours: HOURS },
      { id: 4, name: 'Menlyn', province: 'Gauteng', city: 'Pretoria', tradingHours: HOURS },
    ],
  },
  {
    province: 'Western Cape',
    branches: [
      { id: 12, name: 'Cape Town CBD', province: 'Western Cape', city: 'Cape Town', tradingHours: HOURS },
    ],
  },
];

describe('BranchStep', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function setup() {
    const fixture = TestBed.createComponent(BranchStep);
    const page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges(); // render and send the branches request
    http.expectOne('/api/branches').flush(TEST_BRANCHES);
    await fixture.whenStable();

    const [provinceSelect, branchSelect] = Array.from(page.querySelectorAll('select'));
    const choose = async (select: HTMLSelectElement, value: string) => {
      select.value = value;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const optionsOf = (select: HTMLSelectElement) =>
      Array.from(select.querySelectorAll('option:not([hidden])')).map((el) => el.textContent);
    return { fixture, provinceSelect, branchSelect, choose, optionsOf };
  }

  it('lists the provinces, starts blank, and keeps the branch list disabled until one is chosen', async () => {
    const { provinceSelect, branchSelect, optionsOf } = await setup();
    expect(optionsOf(provinceSelect)).toEqual(['Gauteng', 'Western Cape']);
    expect(provinceSelect.value).toBe('');
    expect(branchSelect.disabled).toBe(true);
    expect(optionsOf(branchSelect)).toEqual([]);
  });

  it('lists only the branches in the chosen province as "name, city"', async () => {
    const { provinceSelect, branchSelect, choose, optionsOf } = await setup();
    await choose(provinceSelect, 'Gauteng');

    expect(branchSelect.disabled).toBe(false);
    expect(optionsOf(branchSelect)).toEqual(['Sandton, Johannesburg', 'Menlyn, Pretoria']);
  });

  it('remembers the branch chosen, and clears it when the province changes', async () => {
    const { fixture, provinceSelect, branchSelect, choose } = await setup();
    await choose(provinceSelect, 'Gauteng');
    await choose(branchSelect, '4');
    expect(fixture.componentInstance.selected()?.name).toBe('Menlyn');

    await choose(provinceSelect, 'Western Cape');
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(branchSelect.value).toBe('');
  });
});
