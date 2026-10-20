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
    service: 'home-insurance',
    region: 'Brussels',
    timeframe: 'next-3-months',
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
    expect(res.body.reference).toMatch(/^RPL-[0-9A-F]{4}$/);
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
});
