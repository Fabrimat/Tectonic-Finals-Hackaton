import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { CreateIntentDto } from './dto/create-intent.dto';
import { IntentsRepository } from './intents.repository';

@Controller('intents')
export class IntentsController {
  constructor(private readonly intents: IntentsRepository) {}

  @Post()
  create(@Body() dto: CreateIntentDto) {
    return this.intents.create(dto);
  }

  @Get()
  @UseGuards(ApiKeyGuard)
  findAll() {
    return this.intents.findAll();
  }
}
