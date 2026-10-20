import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';
import { setStaticRootForTests } from '../src/static-root';

async function createApp(staticDir: string): Promise<INestApplication> {
  setStaticRootForTests(staticDir);
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, ['http://localhost:5173']);
  await app.init();
  return app;
}

describe('static frontend (e2e)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'static-test-'));
  let app: INestApplication;

  beforeAll(async () => {
    mkdirSync(join(dir, 'assets'));
    writeFileSync(join(dir, 'index.html'), '<!doctype html><title>KBC energy transition</title>');
    writeFileSync(join(dir, 'assets', 'app.js'), 'console.log(1)');
    app = await createApp(dir);
  });

  afterAll(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('serves index.html at the root with a strict CSP', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.text).toContain('<title>KBC energy transition</title>');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
  });

  it('serves built assets', async () => {
    await request(app.getHttpServer()).get('/assets/app.js').expect(200);
  });

  it('falls back to index.html for client routes', async () => {
    const res = await request(app.getHttpServer()).get('/app/some/deep/link').expect(200);
    expect(res.text).toContain('<title>KBC energy transition</title>');
  });

  it('leaves /api routes alone', async () => {
    const health = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(health.body).toEqual({ status: 'ok' });
    await request(app.getHttpServer()).get('/api/does-not-exist').expect(404);
    await request(app.getHttpServer()).get('/api/intents').expect(401);
  });

  it('never serves files from outside the root', async () => {
    const dots = "%2e%2e";
    const paths = [
      `/..%2f..%2fetc/passwd`,
      `/${dots}/`,
      `/..%5c..%5cwindows/win.ini`,
      "/.env",
      "//etc/passwd",
      `/${dots}/${dots}/etc/passwd`,
    ];
    for (const path of paths) {
      const res = await request(app.getHttpServer()).get(path);
      expect([200, 400, 403, 404]).toContain(res.status);
      if (res.status === 200) expect(res.text).toContain('<title>KBC energy transition</title>');
      expect(res.text).not.toMatch(/root:|\[fonts\]|\[extensions\]/);
    }
  });

  it('serves nothing extra when the directory does not exist', async () => {
    const bare = await createApp(join(dir, 'missing'));
    await request(bare.getHttpServer()).get('/').expect(404);
    await request(bare.getHttpServer()).get('/api/health').expect(200);
    await bare.close();
  });
});
