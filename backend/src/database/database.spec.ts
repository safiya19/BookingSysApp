import { DataSource } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity.js';
import { BankService } from '../bank-services/bank-service.entity.js';
import { Branch } from '../branches/branch.entity.js';
import { PROVINCES } from '../branches/provinces.js';
import { buildDataSourceOptions } from './data-source-options.js';
import { BRANCH_SEED } from './seed/branches.seed.js';
import { SeedService } from './seed/seed.service.js';
import { SERVICE_SEED } from './seed/services.seed.js';

describe('Database schema and reference data', () => {
  let dataSource: DataSource;
  let seed: SeedService;

  beforeEach(async () => {
    dataSource = new DataSource(buildDataSourceOptions(':memory:'));
    await dataSource.initialize(); // runs migrations
    seed = new SeedService(dataSource);
    await seed.run();
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('migrations produce exactly the schema the entities describe', async () => {
    const pending = await dataSource.driver.createSchemaBuilder().log();
    expect(pending.upQueries.map((q) => q.query)).toEqual([]);
  });

  it('migrations can be rolled back', async () => {
    await dataSource.undoLastMigration();
    const tables = await dataSource.query(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('branches', 'services', 'appointments')`,
    );
    expect(tables).toEqual([]);
  });

  it('seeds every branch and service', async () => {
    expect(await dataSource.getRepository(Branch).count()).toBe(
      BRANCH_SEED.length,
    );
    expect(await dataSource.getRepository(BankService).count()).toBe(
      SERVICE_SEED.length,
    );
  });

  it('has at least one branch in every province', async () => {
    const provinces = new Set(BRANCH_SEED.map((b) => b.province));
    expect([...provinces].sort()).toEqual([...PROVINCES].sort());
  });

  it('is safe to run again without duplicating rows or breaking bookings', async () => {
    const branch = await dataSource
      .getRepository(Branch)
      .findOneByOrFail({ name: 'Sandton' });
    const service = await dataSource
      .getRepository(BankService)
      .findOneByOrFail({ code: 'FOREX' });

    await dataSource.getRepository(Appointment).save({
      reference: 'TB-TEST01',
      branchId: branch.id,
      serviceId: service.id,
      startTime: new Date('2026-12-01T07:00:00Z'),
      firstName: 'Thandi',
      lastName: 'Nkosi',
      email: 'thandi@example.com',
      mobile: '+27821234567',
      idNumber: null,
      popiaConsent: true,
    });

    await seed.run();

    expect(await dataSource.getRepository(Branch).count()).toBe(
      BRANCH_SEED.length,
    );
    const reloaded = await dataSource
      .getRepository(Branch)
      .findOneByOrFail({ name: 'Sandton' });
    expect(reloaded.id).toBe(branch.id);
  });

  it('rejects an appointment with an unknown status', async () => {
    const branch = await dataSource
      .getRepository(Branch)
      .findOneByOrFail({ name: 'Sandton' });
    const service = await dataSource
      .getRepository(BankService)
      .findOneByOrFail({ code: 'FOREX' });

    await expect(
      dataSource.getRepository(Appointment).save({
        reference: 'TB-TEST02',
        branchId: branch.id,
        serviceId: service.id,
        startTime: new Date('2026-12-01T07:00:00Z'),
        firstName: 'Sipho',
        lastName: 'Dlamini',
        email: 'sipho@example.com',
        mobile: '+27831234567',
        idNumber: null,
        popiaConsent: true,
        status: 'PENDING' as never,
      }),
    ).rejects.toThrow(/CHECK constraint failed/);
  });
});
