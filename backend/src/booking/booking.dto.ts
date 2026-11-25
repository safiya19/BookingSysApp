import { Transform, Type } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { BRANCHES, SERVICES } from '../catalogue/catalogue.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const removeSpaces = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\s/g, '') : value;

const BRANCH_IDS = BRANCHES.map((b) => b.id);

export class AvailabilityQuery {
  /** Branch id from GET /api/branches, e.g. 4 (Sandton). */
  @Type(() => Number) // query strings arrive as text
  @IsIn(BRANCH_IDS, { message: 'branchId must be a known branch' })
  branchId: number;

  /** "YYYY-MM-DD" */
  @Matches(DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;
}

export class CreateAppointmentDto {
  @IsIn(SERVICES.map((s) => s.code), {
    message: 'serviceCode must be a known service',
  })
  serviceCode: string;

  /** Branch id from GET /api/branches, e.g. 4 (Sandton). */
  @IsIn(BRANCH_IDS, { message: 'branchId must be a known branch' })
  branchId: number;

  /** "YYYY-MM-DD" */
  @Matches(DATE, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  /** "HH:mm", one of the times from the availability endpoint. */
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be in HH:mm format' })
  time: string;

  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;

  /** South African cellphone number, e.g. "082 123 4567". */
  @Transform(removeSpaces)
  @Matches(/^0[6-8]\d{8}$/, {
    message:
      'mobile must be a South African cellphone number, e.g. 082 123 4567',
  })
  mobile: string;

  /** Optional 13-digit South African ID number. */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s/g, '') || undefined : value,
  )
  @IsOptional()
  @Matches(/^\d{13}$/, { message: 'idNumber must be 13 digits' })
  idNumber?: string;

  /** Must be ticked: consent to process personal information (POPIA). */
  @Equals(true, { message: 'popiaConsent must be accepted' })
  popiaConsent: boolean;
}
