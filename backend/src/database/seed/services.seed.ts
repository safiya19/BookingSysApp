export interface ServiceSeed {
  code: string;
  name: string;
}

/** Every branch offers all of these services. */
export const SERVICE_SEED: readonly ServiceSeed[] = [
  { code: 'CUSTOMER_SERVICE', name: 'Customer Service' },
  { code: 'COLLECTIONS', name: 'Collections' },
  { code: 'FOREX', name: 'Forex' },
  { code: 'ACCOUNTS_AND_LENDING', name: 'Accounts & Lending' },
];
