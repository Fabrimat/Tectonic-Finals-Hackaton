import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { safeId } from '../common/safe-id';
import { PlanRequestDto } from './dto/plan-request.dto';
import { ScenarioQueryDto } from './dto/scenario-query.dto';
import { PlanService } from './plan.service';

@Controller('plan')
export class PlanController {
  constructor(private readonly plans: PlanService) {}

  @Post()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  create(@Body() dto: PlanRequestDto) {
    return this.plans.create(dto);
  }

  @Get('scenarios')
  listScenarios() {
    return this.plans.listScenarios();
  }

  @Get('scenarios/:id')
  findScenario(@Param('id') id: string, @Query() query: ScenarioQueryDto) {
    const plan = this.plans.findScenario(safeId(id, 'scenario id'), query.stage);
    if (!plan) throw new NotFoundException('Scenario not found');
    return plan;
  }
}
