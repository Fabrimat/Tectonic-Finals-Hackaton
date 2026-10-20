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
| `TRUST_PROXY` | `0` | Number of reverse proxies in front of the app. Behind a proxy, set it so the rate limit keys on the real client address |
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

`POST /api/plan` takes `scenarioId`, `asOf` (`YYYY-MM-DD`, default today), `dates` (`{ kind, date }`), `spend` (`{ category, total, count }`), `flags` (strings), `history`, `confirmedIntents` and `area` (`buildingStockAge`, `historicCentre`, `openGroupRounds`; group rounds are defined in `data/group-rounds.json`). All are optional and unknown properties are a 400. Rules, thresholds and candidate catalogue ids live in `data/rules.json`; the legal and grant statements shown to customers live in `data/facts.json` and are marked `verified: false` until checked against official sources.

Stage windows are set per rule in `thresholds` (household: whisper 12 to 36 months ahead, forming 3 to 12, ready 0 to 3; bakery: 12 to 6, 6 to 3, 3 to 0; upper bounds inclusive). A date condition holds for its stage or a sooner one. Partner steps are only returned in `ready`. Earlier stages return `actions` from the rule's `allowedActions`: whisper allows only `awareness` and customer-initiated `optional` actions, forming adds `opportunity` and `introduction`, and nothing marked `sharesData` is offered unless it is `optional`. Area notes and open group rounds appear from forming on. Steps and actions come from catalogue entries only; ones the catalogue does not know are dropped. A candidate marked `proposed` is returned with `proposed: true`. A step with `notNeeded: true` is a "not needed" card.

`data/scenarios.json` holds precomputed plans per stage for `household-maes` and `bakery-leuven`, so the demo needs no live call. Regenerate them after changing the rules with `npm run generate:scenarios` (script in `scripts/`).

### Confidence

Each rule lists weighted signals in `data/rules.json` (weights sum to 100). The matched signals are returned as `evidence` (`signalId`, `label`, `weight`, `contribution`) and add up to a `score` from 0 to 100. The time window sets the highest stage a customer can reach. The score decides whether the card is shown: below `confidence.low` nothing is shown and the plan lists the intent under `suppressed` with a reason, between `low` and `high` only whisper is shown, from `high` the window's stage applies. Thresholds are set per rule, so per segment.

Global settings live in `data/engine.json`:
- `sensitiveCategories`: spend rows in these categories are dropped before anything is evaluated and never appear in the output.
- `history` input (`intent`, `decision` of `dismissed`, `snoozed` or `accepted`, `daysAgo`, optional `category`): a dismissed intent is hidden for `cooldownDays.dismissed`, a snoozed one has its score cut for `cooldownDays.snoozed`, and a spend category the customer dismissed or accepted recently gets a lower or slightly higher weight.
- `confirmedIntents` input and `graph.links`: a confirmed intent adds a bounded boost to linked intents. The boost can lift a score into whisper but never into the full stage on its own, and it never confirms anything.

### Evaluation on synthetic data

`data/eval-customers.json` holds 96 synthetic customers with a true stage, written by `scripts/generate-eval.js` (`npm run generate:eval`, fixed seed). The generator draws the stage first and then adds noise, such as missing and spurious signals. `src/plan/evaluation.spec.ts` runs the engine over it, prints a confusion matrix and asserts precision and recall at ready and forming. These numbers only show that the rules agree with synthetic labels. They say nothing about real customers.

Optional wording: with `PLAN_WORDING_ENABLED=true` and `PLAN_WORDING_URL`, `PLAN_WORDING_KEY`, `PLAN_WORDING_MODEL` set, `POST /api/plan` asks the configured endpoint (chat completions format) to rephrase each `why`. It cannot change ids, titles or roles. Any failure returns the deterministic text. It is off by default.
