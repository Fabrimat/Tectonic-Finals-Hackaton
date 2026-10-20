import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { ListCatalogueDto } from './dto/list-catalogue.dto';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Get()
  findAll(@Query() query: ListCatalogueDto) {
    return this.catalogue.findAll(query.ecosystem);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const product = this.catalogue.findOne(id);
    if (!product) throw new NotFoundException(`Product "${id}" not found`);
    return product;
  }
}
