import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

const apiKey = process.env.PARTNER_API_KEY as string;

describe('API (e2e)', () => {
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

  it('GET /api/health', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/intents accepts a valid body', async () => {
    const res = await request(app.getHttpServer()).post('/api/intents').send(validIntent).expect(201);
    expect(res.body.reference).toMatch(/^REQ-[0-9A-F]{4}$/);
    expect(res.body.status).toBe('new');
  });

  it('POST /api/intents rejects an extra "name" field', async () => {
    await request(app.getHttpServer())
      .post('/api/intents')
      .send({ ...validIntent, name: 'Jane Doe' })
      .expect(400);
  });

  it('GET /api/intents without a key is rejected', async () => {
    await request(app.getHttpServer()).get('/api/intents').expect(401);
    await request(app.getHttpServer()).get('/api/intents').set('x-api-key', 'wrong').expect(401);
  });

  it('GET /api/intents with the key lists intents', async () => {
    const res = await request(app.getHttpServer()).get('/api/intents').set('x-api-key', apiKey).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/catalogue/:id returns 404 for an unknown id', async () => {
    await request(app.getHttpServer()).get('/api/catalogue/unknown-id').expect(404);
  });

  describe('plan', () => {
    const body = (boilerInvoice: boolean) => ({
      asOf: '2026-10-20',
      flags: boilerInvoice
        ? ['epc_e_or_f', 'energy_bill_rising', 'energy_pages_visited', 'boiler_repair_invoice']
        : ['epc_e_or_f', 'energy_bill_rising'],
      dates: [
        { kind: 'renovation_deadline', date: '2029-06-15' },
        ...(boilerInvoice ? [{ kind: 'boiler_end_of_life', date: '2027-03-01' }] : []),
      ],
    });

    it('POST /api/plan returns catalogue steps for a ready moment', async () => {
      const res = await request(app.getHttpServer()).post('/api/plan').send(body(true)).expect(201);
      expect(res.body.matches[0].stage).toBe('ready');
      expect(res.body.wording).toBe('deterministic');
      const steps: { id: string; proposed: boolean }[] = res.body.steps;
      expect(steps.some((s) => s.proposed)).toBe(true);
      for (const step of steps.filter((s) => !s.proposed)) {
        await request(app.getHttpServer()).get(`/api/catalogue/${step.id}`).expect(200);
      }
    });

    it('POST /api/plan returns no steps before the ready stage', async () => {
      const res = await request(app.getHttpServer()).post('/api/plan').send(body(false)).expect(201);
      expect(res.body.matches[0].stage).toBe('whisper');
      expect(res.body.steps).toEqual([]);
    });

    it('POST /api/plan rejects extra fields, nested ones too', async () => {
      await request(app.getHttpServer()).post('/api/plan').send({ ...body(true), name: 'Jane Doe' }).expect(400);
      const nested = body(true);
      await request(app.getHttpServer())
        .post('/api/plan')
        .send({ ...nested, dates: [{ ...nested.dates[0], email: 'a@b.c' }] })
        .expect(400);
    });

    it('POST /api/plan accepts an area and rejects unknown area fields', async () => {
      const area = {
        buildingStockAge: 60,
        historicCentre: true,
        openGroupRounds: ['solar-panels-east-flanders-2026'],
      };
      const res = await request(app.getHttpServer())
        .post('/api/plan')
        .send({ ...body(true), area })
        .expect(201);
      expect(res.body.areaNotes.length).toBeGreaterThan(0);
      expect(res.body.groupRounds[0].id).toBe('solar-panels-east-flanders-2026');
      await request(app.getHttpServer())
        .post('/api/plan')
        .send({ ...body(true), area: { ...area, postcode: '9000' } })
        .expect(400);
      await request(app.getHttpServer())
        .post('/api/plan')
        .send({ ...body(true), area: { buildingStockAge: -1 } })
        .expect(400);
    });

    it('POST /api/plan returns score and evidence, and honours a recent dismissal', async () => {
      const res = await request(app.getHttpServer()).post('/api/plan').send(body(true)).expect(201);
      expect(res.body.matches[0].score).toBeGreaterThan(0);
      expect(res.body.matches[0].evidence[0]).toEqual(
        expect.objectContaining({ signalId: expect.any(String), label: expect.any(String) }),
      );
      const history = [{ intent: 'home-energy-renovation', decision: 'dismissed', daysAgo: 10 }];
      const hidden = await request(app.getHttpServer())
        .post('/api/plan')
        .send({ ...body(true), history, confirmedIntents: ['business-energy-and-fleet'] })
        .expect(201);
      expect(hidden.body.matches).toEqual([]);
      expect(hidden.body.suppressed[0].reason).toBe('cooldown-dismissed');
    });

    it('POST /api/plan rejects bad history entries', async () => {
      const bad = [{ intent: 'x', decision: 'maybe', daysAgo: 1 }];
      await request(app.getHttpServer()).post('/api/plan').send({ ...body(true), history: bad }).expect(400);
      const extra = [{ intent: 'x', decision: 'snoozed', daysAgo: 1, name: 'Jane' }];
      await request(app.getHttpServer()).post('/api/plan').send({ ...body(true), history: extra }).expect(400);
    });

    it('POST /api/plan in whisper shares nothing by default', async () => {
      const res = await request(app.getHttpServer()).post('/api/plan').send(body(false)).expect(201);
      expect(res.body.actions.length).toBeGreaterThan(0);
      for (const a of res.body.actions) expect(!a.sharesData || a.optional).toBe(true);
    });

    it('POST /api/plan rejects invalid dates', async () => {
      await request(app.getHttpServer()).post('/api/plan').send({ ...body(true), dates: [{ kind: 'renovation_deadline', date: '2026-02-30' }] }).expect(400);
    });

    it('GET /api/plan/scenarios/:id serves a cached plan per stage', async () => {
      const res = await request(app.getHttpServer()).get('/api/plan/scenarios/household-maes').expect(200);
      expect(res.body.source).toBe('cached');
      expect(res.body.steps.length).toBeGreaterThan(0);
      const early = await request(app.getHttpServer())
        .get('/api/plan/scenarios/bakery-leuven?stage=whisper')
        .expect(200);
      expect(early.body.steps).toEqual([]);
      await request(app.getHttpServer()).get('/api/plan/scenarios/bakery-leuven?stage=late').expect(400);
      await request(app.getHttpServer()).get('/api/plan/scenarios/unknown').expect(404);
    });

    it('GET /api/plan/scenarios lists scenarios', async () => {
      const res = await request(app.getHttpServer()).get('/api/plan/scenarios').expect(200);
      expect(res.body.map((s: { id: string }) => s.id)).toContain('bakery-leuven');
    });
  });
});
