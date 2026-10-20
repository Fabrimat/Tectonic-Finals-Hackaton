import { readFileSync } from 'fs';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

describe('Intent values (e2e)', () => {
  let app: INestApplication;

  const validIntent = {
    scenarioId: 'moving-home',
    stepId: 'insure',
    service: 'Heating quote',
    region: 'Ghent',
    timeframe: 'Q1 2027',
    budgetBand: 'B',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, ['http://localhost:5173']);
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /api/intents rejects personal data in region, service and timeframe', async () => {
    const bad: Record<string, string>[] = [
      { region: 'Jane Doe' },
      { region: 'Korenmarkt 12, 9000 Ghent' },
      { service: 'jane.doe@example.com' },
      { service: '+32 471 23 45 67' },
      { service: 'Heating quote for Jane Doe' },
      { timeframe: 'call me on 0471234567' },
      { timeframe: 'Q5 2026' },
      { scenarioId: 'Jane Doe' },
      { stepId: 'a@b.c' },
      { budgetBand: 'D' },
    ];
    for (const patch of bad) {
      await request(app.getHttpServer()).post('/api/intents').send({ ...validIntent, ...patch }).expect(400);
    }
  });

  it('POST /api/intents accepts every intent the frontend scenarios post', async () => {
    const source = readFileSync(join(__dirname, '../../frontend/src/data/scenarios.js'), 'utf8');
    const intents = [
      ...source.matchAll(/intent: \{ service: "([^"]+)", region: "([^"]+)", timeframe: "([^"]+)", budgetBand: "([ABC])" \}/g),
    ];
    const ids = [...source.matchAll(/^\s*id: "([a-z0-9_-]+)"/gm)].map((m) => m[1]);
    expect(intents.length).toBeGreaterThanOrEqual(9);
    for (const [, service, region, timeframe, budgetBand] of intents) {
      await request(app.getHttpServer())
        .post('/api/intents')
        .send({ scenarioId: 'household-maes', stepId: ids[0], service, region, timeframe, budgetBand })
        .expect(201);
    }
  });
});
