# Ripple backend

Small NestJS API for the Ripple proof of concept. It serves the product catalogue and collects anonymous intents. Intents never carry personal data: the DTO rejects any property it does not know, so a payload with a name or email is a 400.

Storage is in memory, so intents are lost on restart. At most 1000 intents are kept, oldest first out.

## Run

```
cp .env.example .env
npm install
npm run start:dev      # watch mode
npm run build && npm run start
```

Configuration (environment variables, validated at startup):

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma separated list of allowed origins |
| `RATE_LIMIT_PER_MINUTE` | `300` | Requests per minute per client |
| `PARTNER_API_KEY` | none | Required, at least 24 characters. Sent as the `x-api-key` header to read intents |
| `STATIC_DIR` | `frontend/dist` of the repository | Built frontend served from the same origin, skipped when the directory has no `index.html` |

## Test

```
npm test            # unit tests
npm run test:e2e    # HTTP tests
npm run typecheck
```

## Endpoints

All routes are under `/api`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Returns `{ "status": "ok" }` |
| GET | `/api/catalogue` | Lists products, optional `?ecosystem=<ecosystemId>` |
| GET | `/api/catalogue/:id` | One product, 404 if unknown |
| POST | `/api/intents` | Creates an anonymous intent, returns it with a reference like `RPL-4F2A` and status `new` |
| GET | `/api/intents` | Lists intents. Needs the `x-api-key` header, 401 otherwise |
| POST | `/api/plan` | Builds a plan from signals with the rules in `data/rules.json` |
| GET | `/api/plan/scenarios` | Lists the cached scenarios |
| GET | `/api/plan/scenarios/:id` | Cached plan, optional `?stage=whisper\|forming\|ready` (default `ready`) |

Intent body: `scenarioId`, `stepId`, `service`, `region`, `timeframe` (strings, max 64 characters) and `budgetBand` (`A`, `B` or `C`).

`CatalogueService.keepKnown(ids)` drops ids that are not in `data/catalogue.json`. Use it on any model-generated plan before returning it.

## Plan

`POST /api/plan` takes `scenarioId`, `asOf` (`YYYY-MM-DD`, default today), `dates` (`{ kind, date }`), `spend` (`{ category, total, count }`) and `flags` (strings). All are optional and unknown properties are a 400. Rules, thresholds and candidate catalogue ids live in `data/rules.json`; the legal and grant statements shown to customers live in `data/facts.json` and are marked `verified: false` until checked against official sources.

Stages follow the date windows in the rule: whisper 12 to 36 months ahead, forming 3 to 12, ready 0 to 3 (upper bounds inclusive, overridable per rule). Partner steps are only returned in the `ready` stage. Earlier stages return the matched card and a `watching` list, nothing actionable. Steps come from catalogue entries only; candidates the catalogue does not know are dropped. A candidate marked `proposed` in the rules is returned with `proposed: true`. A step with `notNeeded: true` is a "not needed" card.

`data/scenarios.json` holds precomputed plans per stage for `household-maes` and `bakery-leuven`, so the demo needs no live call.

Optional wording: with `PLAN_WORDING_ENABLED=true` and `PLAN_WORDING_URL`, `PLAN_WORDING_KEY`, `PLAN_WORDING_MODEL` set, `POST /api/plan` asks the configured endpoint (chat completions format) to rephrase each `why`. It cannot change ids, titles or roles. Any failure returns the deterministic text. It is off by default.
