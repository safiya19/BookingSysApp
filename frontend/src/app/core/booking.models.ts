/**
 * full set of data structures for the Titans Bank booking API 
 * Components load data with httpResource and submit the
 * booking with HttpClient.post, using these types.
 */

export interface BankService {
  code: string;
  name: string;
  description: string;
}

export interface Branch {
  id: number;
  name: string;
  province: string;
  city: string;
  tradingHours: string;
}

export interface ProvinceBranches {
  province: string;
  branches: Branch[];
}

export interface PublicHoliday {
  date: string; // "YYYY-MM-DD"
  name: string;
}

export interface Availability {
  branchId: number;
  date: string;
 // Free start times will be displayed. Fully booked times are left out. 
  times: string[];
}

export interface BookingRequest {
  serviceCode: string;
  branchId: number;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  idNumber?: string;
  passportNumber?: string;
  popiaConsent: boolean;
}

/** Data collected from Your Details page entered by the user to create a BookingRequest. */
export type CustomerDetails = Pick<
  BookingRequest,
  'firstName' | 'lastName' | 'email' | 'mobile' | 'idNumber' | 'passportNumber' | 'popiaConsent'
>;

export interface BookingConfirmation {
  reference: string;
  service: BankService;
  branchName: string;
  date: string;
  time: string;
  customer: { firstName: string; lastName: string; email: string; mobile: string };
  message: string;
}
