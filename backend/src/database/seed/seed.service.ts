import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BankService } from '../../bank-services/bank-service.entity.js';
import { Branch } from '../../branches/branch.entity.js';
import { BRANCH_SEED } from './branches.seed.js';
import { SERVICE_SEED } from './services.seed.js';

/**
 * Loads reference data (branches and services).
 *
 * Idempotent: rows are matched on their natural keys (branch name, service
 * code), so running it on every start-up inserts anything missing and updates
 * changed details without creating duplicates or touching appointments.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.upsert(BankService, [...SERVICE_SEED], ['code']);
      await manager.upsert(Branch, [...BRANCH_SEED], ['name']);
    });

    this.logger.log(
      `Reference data ready: ${SERVICE_SEED.length} services, ${BRANCH_SEED.length} branches`,
    );
  }
}
