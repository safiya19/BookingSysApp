import { Module, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppConfig } from '../config/env.validation.js';
import { buildDataSourceOptions } from './data-source-options.js';
import { SeedService } from './seed/seed.service.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) =>
        buildDataSourceOptions(config.get('DATABASE_PATH', { infer: true })),
    }),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule implements OnApplicationBootstrap {
  constructor(
    private readonly seedService: SeedService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get('SEED_ON_STARTUP', { infer: true }) === 'true') {
      await this.seedService.run();
    }
  }
}
