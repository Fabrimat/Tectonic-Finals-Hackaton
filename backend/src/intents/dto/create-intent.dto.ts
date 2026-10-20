import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateIntentDto {
  @IsString() @MinLength(1) @MaxLength(64)
  scenarioId: string;

  @IsString() @MinLength(1) @MaxLength(64)
  stepId: string;

  @IsString() @MinLength(1) @MaxLength(64)
  service: string;

  @IsString() @MinLength(1) @MaxLength(64)
  region: string;

  @IsString() @MinLength(1) @MaxLength(64)
  timeframe: string;

  @IsIn(['A', 'B', 'C'])
  budgetBand: 'A' | 'B' | 'C';
}
