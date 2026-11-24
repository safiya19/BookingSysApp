import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

/**
 * Environment variables the API understands. Validated once at start-up so a
 * misconfigured container fails immediately with a clear message instead of
 * misbehaving later.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  NODE_ENV: 'development' | 'test' | 'production' = 'development';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  /** Path to the SQLite file. Use ":memory:" for a throwaway database. */
  @IsOptional()
  @IsString()
  DATABASE_PATH: string = 'data/titans-bank.db';

  /** Insert or refresh branches and services at start-up. */
  @IsOptional()
  @IsBooleanString()
  SEED_ON_STARTUP: string = 'true';
}

export type AppConfig = EnvironmentVariables;

export function validateEnv(config: Record<string, unknown>): AppConfig {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map(
        (e) =>
          `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
      )
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return validated;
}
