import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A type of appointment a customer can book, such as Forex or Collections.
 * Named BankService to avoid confusion with NestJS "services".
 */
@Entity({ name: 'services' })
export class BankService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Stable identifier used by the API and frontend, e.g. "FOREX". */
  @Column({ type: 'varchar', length: 40, unique: true })
  code: string;

  /** Customer-facing name, e.g. "Forex". */
  @Column({ type: 'varchar', length: 100 })
  name: string;
}
