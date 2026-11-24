import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates branches, services and appointments.
 *
 * The schema is managed by migrations rather than TypeORM's `synchronize`, so
 * changes are explicit, reviewable and safe to run against existing data.
 *
 * The SQL is kept on single lines in the exact form TypeORM generates, so the
 * schema-drift test in database.spec.ts can compare it with the entities.
 */
export class InitialSchema1764000000000 implements MigrationInterface {
  name = 'InitialSchema1764000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(40) NOT NULL, "name" varchar(100) NOT NULL, CONSTRAINT "UQ_f019a17cb439406ab185382df9b" UNIQUE ("code"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branches" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(100) NOT NULL, "province" varchar(50) NOT NULL, "city" varchar(100) NOT NULL, CONSTRAINT "UQ_8387ed27b3d4ca53ec3fc7b029c" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_branches_province" ON "branches" ("province")`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" varchar PRIMARY KEY NOT NULL, "reference" varchar(12) NOT NULL, "branchId" varchar(36) NOT NULL, "serviceId" varchar(36) NOT NULL, "startTime" datetime NOT NULL, "firstName" varchar(100) NOT NULL, "lastName" varchar(100) NOT NULL, "email" varchar(254) NOT NULL, "mobile" varchar(16) NOT NULL, "idNumber" varchar(13), "popiaConsent" boolean NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('CONFIRMED'), "cancelledAt" datetime, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_add06d02b234388a3a1ecbc6f04" UNIQUE ("reference"), CONSTRAINT "CHK_appointments_status" CHECK ("status" IN ('CONFIRMED', 'CANCELLED')), CONSTRAINT "FK_299d8147ef59909b1e6531e791c" FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_f77953c373efb8ab146d98e90c3" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_appointments_slot" ON "appointments" ("branchId", "serviceId", "startTime")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_appointments_slot"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP INDEX "IDX_branches_province"`);
    await queryRunner.query(`DROP TABLE "branches"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
