import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'appointments' })
// Speeds up "how many bookings does this branch have at this time?"
@Index(['branchId', 'date', 'time'])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  /** Customer-facing reference, e.g. "TB-7K3P9Q". */
  @Column({ type: 'varchar', length: 9, unique: true })
  reference: string;

  @Column({ type: 'varchar', length: 40 })
  serviceCode: string;

  @Column({ type: 'integer' })
  branchId: number;

  /** "YYYY-MM-DD", South African time. */
  @Column({ type: 'varchar', length: 10 })
  date: string;

  /** "HH:mm", South African time. */
  @Column({ type: 'varchar', length: 5 })
  time: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 10 })
  mobile: string;

  @Column({ type: 'varchar', length: 13, nullable: true })
  idNumber: string | null;

  /** Optional, any length, so stored as text rather than a fixed-length varchar. */
  @Column({ type: 'text', nullable: true })
  passportNumber: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
