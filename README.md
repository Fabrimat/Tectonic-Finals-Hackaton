# Ripple

Ripple is a proof of concept for the home and business energy transition. It watches for a life or business moment that is coming, such as a renovation deadline or a boiler near the end of its life, and turns it into a short plan with partners from a small ecosystem. The aim is to predict the moment early instead of reacting once it has passed.

Each moment moves along a ladder:

- whisper: 12 to 36 months ahead, the person only sees that something is on the horizon
- forming: 3 to 12 months ahead, the matched card and a list of things being watched
- ready: 0 to 3 months ahead, the plan board with concrete steps

What is in the app:

- a customer view with the ladder, a confirm step and a plan board
- anonymous intents: accepting a step sends scenario, step, service, region, timeframe and budget band, never a name or contact detail
- a partner portal that reads those intents
- an ecosystem map showing how the partners relate
- a numbers page with the economics behind the pilot

Two scenarios are included, a household (`household-maes`) and a bakery (`bakery-leuven`).

## Layout

- `frontend/` React and Vite single page app
- `backend/` NestJS API, see `backend/README.md` for endpoints
- `Dockerfile` builds both and serves them from one process

## Run for development

Backend, in one terminal:

```
cd backend
cp .env.example .env     # then set PARTNER_API_KEY
npm install
npm run start:dev
```

Frontend, in another:

```
cd frontend
npm install
npm run dev
```

The Vite dev server runs on http://localhost:5173 and proxies `/api` to http://localhost:3000. Set `API_TARGET` to point it somewhere else.

Backend environment variables:

| Variable | Default | Meaning |
| --- | --- | --- |
| `PARTNER_API_KEY` | none | Required, at least 24 characters. Sent as `x-api-key` to read intents |
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma separated allowed origins |
| `RATE_LIMIT_PER_MINUTE` | `300` | Requests per minute per client |
| `STATIC_DIR` | `frontend/dist` | Built frontend to serve, ignored if missing |
| `PLAN_WORDING_ENABLED` | `false` | Let a model rephrase the "why" text of plan steps |
| `PLAN_WORDING_URL` | empty | Chat completions style endpoint, needed when wording is enabled |
| `PLAN_WORDING_KEY` | empty | Key for that endpoint, needed when wording is enabled |
| `PLAN_WORDING_MODEL` | empty | Model name, needed when wording is enabled |

The wording option is off by default and the plan is complete without it. It cannot change ids, titles or roles, and any failure falls back to the fixed text.

Checks:

```
cd backend && npm run typecheck && npm test && npm run test:e2e
cd frontend && npm test && npm run lint
```

## Serve everything from one URL

When `frontend/dist` exists, the backend serves it next to the API. Any path outside `/api` that is not a file returns `index.html`, so links like `/app` or `/partner` work on reload.

```
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build
PARTNER_API_KEY=<at least 24 random characters> npm start
```

Then open http://localhost:3000. The frontend calls `/api` on the same origin, so no CORS setting is needed.

With Docker:

```
docker build -t ripple .
docker run --rm -p 3000:3000 -e PARTNER_API_KEY=<at least 24 random characters> ripple
```

The image runs as the non root `node` user, contains production dependencies only, and has a health check on `/api/health`. Pass the other variables from the table above with more `-e` flags if needed.

## Using the demo

The customer view at `/app` has a demo control to switch a scenario between whisper, forming and ready, so the whole ladder can be shown without waiting. Cached plans for each stage come from the backend, so no live call is needed.

The partner portal at `/partner` has a demo access field. Enter the value of `PARTNER_API_KEY` to read intents from the service. Without a key, or if the key is rejected or the service is down, it shows the requests stored in the browser on that device. `/map` shows the ecosystem and the numbers are in the partner portal.

## Unfinished

- Partner names and roles are demo assumptions, no partner has agreed to anything.
- Legal and grant statements in `backend/data/facts.json` are marked `verified: false` and have not been checked against official sources.
- Intents are kept in memory, at most 1000, and are lost on restart.
- There are no real integrations with partners, utilities or data sources.
- All people, businesses, invoices and figures are synthetic.

## Security choices

- Intents are anonymous by design. The request body is validated with a whitelist and any unknown property, such as a name or email, is rejected with a 400. Plan requests are validated the same way.
- Reading intents needs the `x-api-key` header. The key comes from the environment, the server refuses to start with a short or placeholder value, and nothing secret is stored in the repository.
- The JSON body limit is 10 kB and there is a per client rate limit.
- Helmet sets the security headers. The content security policy allows only the same origin: no inline scripts, no inline styles, no framing, images from the same origin or data URIs.
- CORS is limited to the origins listed in `CORS_ORIGINS`.
- The optional wording key stays on the server and is never sent to the browser.
- The container runs as a non root user and holds no development dependencies.
