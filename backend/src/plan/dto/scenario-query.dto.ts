import { IsIn, IsOptional } from 'class-validator';
import { Stage } from '../plan.types';

export class ScenarioQueryDto {
  @IsOptional()
  @IsIn(['whisper', 'forming', 'ready'])
  stage?: Stage;
}
