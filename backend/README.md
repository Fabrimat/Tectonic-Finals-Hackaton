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

Intent body: `scenarioId`, `stepId`, `service`, `region`, `timeframe` (strings, max 64 characters) and `budgetBand` (`A`, `B` or `C`).

`CatalogueService.keepKnown(ids)` drops ids that are not in `data/catalogue.json`. Use it on any model-generated plan before returning it.
