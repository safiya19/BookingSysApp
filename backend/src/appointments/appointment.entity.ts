import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { BankService } from '../bank-services/bank-service.entity.js';
import { Branch } from '../branches/branch.entity.js';
import type { AppointmentStatus } from './appointment-status.js';

@Entity({ name: 'appointments' })
@Check('CHK_appointments_status', `"status" IN ('CONFIRMED', 'CANCELLED')`)
// Supports the availability query: "how many confirmed bookings does this
// branch have for this service at this time?"
@Index('IDX_appointments_slot', ['branchId', 'serviceId', 'startTime'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Customer-facing booking reference, e.g. "TB-7K3P9Q". */
  @Column({ type: 'varchar', length: 12, unique: true })
  reference: string;

  @Column({ type: 'varchar', length: 36 })
  branchId: string;

  @ManyToOne(() => Branch, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch?: Relation<Branch>;

  @Column({ type: 'varchar', length: 36 })
  serviceId: string;

  @ManyToOne(() => BankService, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'serviceId' })
  service?: Relation<BankService>;

  /** Slot start, stored in UTC. */
  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  /** Stored in E.164 format, e.g. "+27821234567". */
  @Column({ type: 'varchar', length: 16 })
  mobile: string;

  /** Optional South African ID number. */
  @Column({ type: 'varchar', length: 13, nullable: true })
  idNumber: string | null;

  /** Customer agreed to processing of personal information (POPIA). */
  @Column({ type: 'boolean' })
  popiaConsent: boolean;

  @Column({ type: 'varchar', length: 20, default: 'CONFIRMED' })
  status: AppointmentStatus;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
