import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateIntentDto } from './create-intent.dto';

const valid = {
  scenarioId: 'household-maes',
  stepId: 'heating',
  service: 'Heating quote',
  region: 'Ghent',
  timeframe: 'Q4 2026',
  budgetBand: 'C',
};

const errorsFor = (patch: object) =>
  validateSync(plainToInstance(CreateIntentDto, { ...valid, ...patch })).map((e) => e.property);

describe('CreateIntentDto', () => {
  it('accepts a well formed intent', () => {
    expect(errorsFor({})).toEqual([]);
  });

  it('rejects free text in region, service and timeframe', () => {
    expect(errorsFor({ region: 'Jane Doe' })).toEqual(['region']);
    expect(errorsFor({ service: 'jane@example.com' })).toEqual(['service']);
    expect(errorsFor({ timeframe: 'Korenmarkt 12' })).toEqual(['timeframe']);
  });

  it('rejects ids outside the safe pattern', () => {
    expect(errorsFor({ scenarioId: 'Jane Doe' })).toEqual(['scenarioId']);
    expect(errorsFor({ stepId: 'x'.repeat(65) })).toEqual(['stepId']);
  });
});
