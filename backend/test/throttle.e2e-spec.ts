import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

const apiKey = process.env.PARTNER_API_KEY as string;

async function createApp(trustProxy: number): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, ['http://localhost:5173'], undefined, trustProxy);
  await app.init();
  return app;
}

function listIntents(app: INestApplication, forwardedFor: string) {
  return request(app.getHttpServer())
    .get('/api/intents')
    .set('x-api-key', apiKey)
    .set('x-forwarded-for', forwardedFor);
}

describe('Rate limits (e2e)', () => {
  describe('without a trusted proxy', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp(0);
    });
    afterAll(() => app.close());

    it('limits POST /api/intents to 20 per minute', async () => {
      const body = {
        scenarioId: 'household-maes',
        stepId: 'insulation',
        service: 'Insulation quote',
        region: 'Ghent',
        timeframe: 'Q1 2027',
        budgetBand: 'C',
      };
      for (let i = 0; i < 20; i++) await request(app.getHttpServer()).post('/api/intents').send(body).expect(201);
      await request(app.getHttpServer()).post('/api/intents').send(body).expect(429);
    });

    it('limits GET /api/intents to 10 per minute and ignores x-forwarded-for', async () => {
      for (let i = 0; i < 10; i++) await listIntents(app, `203.0.113.${i}`).expect(200);
      await listIntents(app, '203.0.113.200').expect(429);
    });
  });

  describe('with one trusted proxy', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp(1);
    });
    afterAll(() => app.close());

    it('keys the limit on the forwarded client address', async () => {
      for (let i = 0; i < 10; i++) await listIntents(app, '203.0.113.1').expect(200);
      await listIntents(app, '203.0.113.1').expect(429);
      await listIntents(app, '203.0.113.2').expect(200);
    });
  });
});
