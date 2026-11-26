/**
 * DESCRIPTION
 * The 4 services and 13 branches customers can book. For simplicity, they are defined in 
 * code rather than a database. Every branch offers every service.
 */

export interface BankService {
  code: string;
  name: string;
  description: string;
}

/**List of services offered by Titans Bank 
 * in the order they should appear in the frontend.
 */
export const SERVICES: readonly BankService[] = [
  {
    code: 'CUSTOMER_SERVICE',
    name: 'Customer Service',
    description: 'General enquiries and help with your banking.',
  },
  {
    code: 'COLLECTIONS',
    name: 'Collections',
    description: 'Bank card collections, documents and other items.',
  },
  {
    code: 'FOREX',
    name: 'Forex',
    description: 'Foreign exchange and international transfers.',
  },
  {
    code: 'ACCOUNTS_AND_LOANS',
    name: 'Accounts & Lending',
    description: 'Account management, new accounts and loan applications.',
  },
];

/**
 * Selection of provinces where Titans Bank has branches - to be selected on frontend when booking an appointment.
 */
export const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
] as const;

export type Province = (typeof PROVINCES)[number];

/** Interface representing a bank branch. */
export interface Branch {
  id: number;
  name: string;
  province: Province;
  city: string;
}

/** Branches per province. */
export const BRANCHES: readonly Branch[] = [
  { id: 1, name: 'East London Vincent', province: 'Eastern Cape', city: 'East London' },
  { id: 2, name: 'Bloemfontein Central', province: 'Free State', city: 'Bloemfontein' },
  { id: 3, name: 'Sandton', province: 'Gauteng', city: 'Johannesburg' },
  { id: 4, name: 'Menlyn', province: 'Gauteng', city: 'Pretoria' },
  { id: 5, name: 'Centurion', province: 'Gauteng', city: 'Centurion' },
  { id: 6, name: 'Umhlanga', province: 'KwaZulu-Natal', city: 'Durban' },
  { id: 7, name: 'Pietermaritzburg', province: 'KwaZulu-Natal', city: 'Pietermaritzburg'},
  { id: 8, name: 'Polokwane', province: 'Limpopo', city: 'Polokwane' },
  { id: 9, name: 'Witbank', province: 'Mpumalanga', city: 'Witbank'},
  { id: 10, name: 'Rustenburg', province: 'North West', city: 'Rustenburg' },
  { id: 11, name: 'Kimberley', province: 'Northern Cape', city: 'Kimberley' },
  { id: 12, name: 'Cape Town CBD', province: 'Western Cape', city: 'Cape Town' },
  { id: 13, name: 'Stellenbosch', province: 'Western Cape', city: 'Stellenbosch' },
];

/** Find a branch by its id.
 * @param id The stable id of the branch, e.g. 1 for East London Vincent.
 * @returns The branch object, or undefined if not found.
 */
export const findBranch = (id: number) => BRANCHES.find((b) => b.id === id);
export const findService = (code: string) =>
  SERVICES.find((s) => s.code === code);
