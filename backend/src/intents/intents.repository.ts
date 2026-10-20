import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateIntentDto } from './dto/create-intent.dto';
import { Intent } from './intent.types';

const MAX_INTENTS = 1000;

@Injectable()
export class IntentsRepository {
  private readonly intents = new Map<string, Intent>();

  create(dto: CreateIntentDto): Intent {
    const intent: Intent = {
      reference: this.newReference(),
      status: 'new',
      createdAt: new Date().toISOString(),
      scenarioId: dto.scenarioId,
      stepId: dto.stepId,
      service: dto.service,
      region: dto.region,
      timeframe: dto.timeframe,
      budgetBand: dto.budgetBand,
    };
    this.intents.set(intent.reference, intent);
    if (this.intents.size > MAX_INTENTS) {
      this.intents.delete(this.intents.keys().next().value as string);
    }
    return intent;
  }

  findAll(): Intent[] {
    return [...this.intents.values()];
  }

  private newReference(): string {
    let reference: string;
    do {
      reference = `REQ-${randomBytes(2).toString('hex').toUpperCase()}`;
    } while (this.intents.has(reference));
    return reference;
  }
}
