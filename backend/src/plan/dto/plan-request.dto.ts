import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const KEY = /^[a-z0-9_-]+$/;

export class DateSignalDto {
  @IsString() @MinLength(1) @MaxLength(64) @Matches(KEY)
  kind: string;

  @Matches(DATE_ONLY) @IsISO8601({ strict: true })
  date: string;
}

export class SpendSignalDto {
  @IsString() @MinLength(1) @MaxLength(64) @Matches(KEY)
  category: string;

  @IsNumber() @Min(0) @Max(1_000_000_000)
  total: number;

  @IsInt() @Min(0) @Max(1_000_000)
  count: number;
}

export class PlanRequestDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(64) @Matches(KEY)
  scenarioId?: string;

  @IsOptional() @Matches(DATE_ONLY) @IsISO8601({ strict: true })
  asOf?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => DateSignalDto)
  dates?: DateSignalDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => SpendSignalDto)
  spend?: SpendSignalDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(64, { each: true })
  @Matches(KEY, { each: true })
  flags?: string[];
}
