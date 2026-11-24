import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { Province } from './provinces.js';

@Entity({ name: 'branches' })
@Index('IDX_branches_province', ['province'])
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  province: Province;

  @Column({ type: 'varchar', length: 100 })
  city: string;
}
