import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Product } from './catalogue.types';

const CATALOGUE_FILE = join(__dirname, '..', '..', 'data', 'catalogue.json');

@Injectable()
export class CatalogueService {
  private readonly products: Product[];
  private readonly byId: Map<string, Product>;

  constructor() {
    this.products = JSON.parse(readFileSync(CATALOGUE_FILE, 'utf8')) as Product[];
    this.byId = new Map(this.products.map((p) => [p.id, p]));
  }

  findAll(ecosystem?: string): Product[] {
    if (!ecosystem) return this.products;
    return this.products.filter((p) => p.ecosystemId === ecosystem);
  }

  findOne(id: string): Product | undefined {
    return this.byId.get(id);
  }

  // Drops ids that are not in the catalogue. Applied to model-generated plans.
  keepKnown(ids: string[]): string[] {
    return ids.filter((id) => this.byId.has(id));
  }
}
