import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { ENTITIES } from './entities.js';
import { MIGRATIONS } from './migrations/index.js';

/**
 * Builds the TypeORM options for a SQLite file. Shared by the running app and
 * by tests, so both use exactly the same schema and migrations.
 */
export function buildDataSourceOptions(
  databasePath: string,
): DataSourceOptions {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  return {
    type: 'better-sqlite3',
    database: databasePath,
    entities: ENTITIES,
    migrations: MIGRATIONS,
    migrationsRun: true,
    // Never let TypeORM alter the schema on its own; migrations own it.
    synchronize: false,
    // Write-ahead logging lets reads continue while a booking is being written.
    prepareDatabase: (db: { pragma: (sql: string) => unknown }) => {
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      db.pragma('busy_timeout = 5000');
    },
  };
}
