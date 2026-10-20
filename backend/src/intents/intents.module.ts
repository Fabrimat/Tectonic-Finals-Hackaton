import { Module } from '@nestjs/common';
import { IntentsController } from './intents.controller';
import { IntentsRepository } from './intents.repository';

@Module({
  controllers: [IntentsController],
  providers: [IntentsRepository],
})
export class IntentsModule {}
