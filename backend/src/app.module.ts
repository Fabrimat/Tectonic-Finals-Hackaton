import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { loadConfig } from './config/config';
import { HealthModule } from './health/health.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { IntentsModule } from './intents/intents.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: loadConfig().rateLimitPerMinute }]),
    HealthModule,
    CatalogueModule,
    IntentsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
