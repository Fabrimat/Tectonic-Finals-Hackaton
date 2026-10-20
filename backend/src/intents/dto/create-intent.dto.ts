import { IsIn, IsString, Matches } from 'class-validator';
import { ID_PATTERN, INTENT_REGIONS, INTENT_SERVICES, TIMEFRAME_PATTERN } from '../intent-values';

export class CreateIntentDto {
  @IsString() @Matches(ID_PATTERN)
  scenarioId: string;

  @IsString() @Matches(ID_PATTERN)
  stepId: string;

  @IsIn(INTENT_SERVICES)
  service: string;

  @IsIn(INTENT_REGIONS)
  region: string;

  @IsString() @Matches(TIMEFRAME_PATTERN)
  timeframe: string;

  @IsIn(['A', 'B', 'C'])
  budgetBand: 'A' | 'B' | 'C';
}
