import { Module } from '@nestjs/common';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';

@Module({
  imports: [CatalogueModule],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
