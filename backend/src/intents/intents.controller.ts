import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { CreateIntentDto } from './dto/create-intent.dto';
import { IntentsRepository } from './intents.repository';

@Controller('intents')
export class IntentsController {
  constructor(private readonly intents: IntentsRepository) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  create(@Body() dto: CreateIntentDto) {
    return this.intents.create(dto);
  }

  @Get()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(ApiKeyGuard)
  findAll() {
    return this.intents.findAll();
  }

  @Delete(':reference')
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(ApiKeyGuard)
  remove(@Param('reference') reference: string): void {
    if (!this.intents.remove(reference)) throw new NotFoundException('Intent not found');
  }
}
