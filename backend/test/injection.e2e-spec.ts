import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

const apiKey = process.env.PARTNER_API_KEY as string;

describe('Odd request values (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, ['http://localhost:5173']);
    await app.init();
  });

  afterAll(() => app.close());

  it('route params that are not plain ids are 400 or 404, never 500', async () => {
    const odd = ['__proto__', 'constructor', 'toString', '%5Bobject%20Object%5D', '%7B%22%24ne%22%3A1%7D', 'A%20B'];
    for (const id of odd) {
      for (const base of ['/api/catalogue/', '/api/plan/scenarios/']) {
        const res = await http().get(base + id);
        expect([400, 404]).toContain(res.status);
      }
      const del = await http().delete(`/api/intents/${id}`).set('x-api-key', apiKey);
      expect([400, 404]).toContain(del.status);
    }
  });

  it('query params as arrays or objects are 400', async () => {
    const queries = [
      '/api/catalogue?ecosystem[]=a',
      '/api/catalogue?ecosystem=a&ecosystem=b',
      '/api/catalogue?ecosystem[$ne]=a',
      '/api/plan/scenarios/household-maes?stage[]=ready',
      '/api/plan/scenarios/household-maes?stage=ready&stage=whisper',
      '/api/plan/scenarios/household-maes?stage[$ne]=ready',
      '/api/plan/scenarios/household-maes?stage=constructor',
      '/api/plan/scenarios/household-maes?stage=__proto__',
    ];
    for (const q of queries) await http().get(q).expect(400);
    await http().get('/api/catalogue?__proto__=x').expect(400);
  });

  it('body values that are objects, arrays or prototype keys are 400', async () => {
    const intent = {
      scenarioId: 'household-maes',
      stepId: 'heating',
      service: 'Heating quote',
      region: 'Ghent',
      timeframe: 'Q1 2027',
      budgetBand: 'C',
    };
    for (const field of ['scenarioId', 'stepId', 'service', 'region', 'timeframe', 'budgetBand']) {
      await http().post('/api/intents').send({ ...intent, [field]: { $ne: 'x' } }).expect(400);
      await http().post('/api/intents').send({ ...intent, [field]: ['x'] }).expect(400);
    }
    await http().post('/api/intents').set('content-type', 'application/json').send('{"__proto__":{"x":1}}').expect(400);

    const bodies: Record<string, unknown>[] = [
      { asOf: { $ne: 'x' } },
      { asOf: ['2026-10-20'] },
      { flags: { $ne: 'x' } },
      { flags: [{ $ne: 'x' }] },
      { dates: { kind: 'a' } },
      { area: ['x'] },
      { history: [{ intent: { $ne: 'x' }, decision: 'dismissed', daysAgo: 1 }] },
      { confirmedIntents: [['x']] },
      { constructor: 'x' },
    ];
    for (const body of bodies) await http().post('/api/plan').send(body).expect(400);
    await http()
      .post('/api/plan')
      .set('content-type', 'application/json')
      .send('{"__proto__":{"flags":["x"]}}')
      .expect(400);
    expect(({} as Record<string, unknown>).flags).toBeUndefined();
  });
});
