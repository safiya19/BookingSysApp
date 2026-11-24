import type { Province } from '../../branches/provinces.js';

export interface BranchSeed {
  name: string;
  province: Province;
  city: string;
}

/** Titans Bank branch network, at least one branch per province. */
export const BRANCH_SEED: readonly BranchSeed[] = [
  { name: 'Gqeberha Central', province: 'Eastern Cape', city: 'Gqeberha' },
  {
    name: 'East London Vincent',
    province: 'Eastern Cape',
    city: 'East London',
  },
  {
    name: 'Bloemfontein Central',
    province: 'Free State',
    city: 'Bloemfontein',
  },
  { name: 'Sandton', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Rosebank', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Soweto', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Menlyn', province: 'Gauteng', city: 'Pretoria' },
  { name: 'Centurion', province: 'Gauteng', city: 'Centurion' },
  { name: 'Umhlanga', province: 'KwaZulu-Natal', city: 'Durban' },
  { name: 'Durban Central', province: 'KwaZulu-Natal', city: 'Durban' },
  {
    name: 'Pietermaritzburg',
    province: 'KwaZulu-Natal',
    city: 'Pietermaritzburg',
  },
  { name: 'Polokwane', province: 'Limpopo', city: 'Polokwane' },
  { name: 'Mbombela', province: 'Mpumalanga', city: 'Mbombela' },
  { name: 'Rustenburg', province: 'North West', city: 'Rustenburg' },
  { name: 'Kimberley', province: 'Northern Cape', city: 'Kimberley' },
  { name: 'Cape Town CBD', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Century City', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Stellenbosch', province: 'Western Cape', city: 'Stellenbosch' },
];
