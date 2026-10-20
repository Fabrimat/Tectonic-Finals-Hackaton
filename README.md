# KBC energy transition, proof of concept

A proof of concept for the home and business energy transition. It spots a moment that is coming, such as a renovation deadline or a boiler near the end of its life, and turns it into a short plan with partners from a small ecosystem. The aim is to predict the moment early instead of reacting once it has passed.

There is no live demo. The pitch is slides only, and this app exists to produce clean screenshots and a short screen recording for them. All people, businesses, invoices and figures are synthetic, and every integration with a partner, utility or data source is simulated.

Each moment moves along a ladder, with windows that depend on the segment:

- whisper: the person only sees that something is on the horizon
- forming: a question and a short checklist
- ready: the plan board with concrete steps

Consent has four separate layers, each asked on its own and shown in the customer app: analysis, goal confirmation, sharing with a partner, commitment to a paid step. Partners first receive an anonymous intent (service, area, timeframe, budget band). Contact details follow only when the customer authorises that partner for that step.

What is in the app:

- a customer view styled as a KBC Mobile home screen, with the intent card in the For you feed
- an advisor dashboard at `/partner` with anonymous leads and a panel of what is not shared, and a numbers page at `/partner/numbers`
- an ecosystem map at `/map`

Two scenarios are included, a household (`household-maes`) and a bakery (`bakery-leuven`).

## Layout

- `frontend/` React and Vite single page app
- `backend/` NestJS API, see `backend/README.md` for endpoints and settings
- `Dockerfile` builds both and serves them from one process

## Run

```
cd frontend
npm install
npm run dev
```

The app opens on http://localhost:5173. The backend is optional: without it everything runs from the browser, using the same data. To run it as well, set `PARTNER_API_KEY` (at least 24 characters) in `backend/.env` and start it with `npm run start:dev` in `backend/`. Vite proxies `/api` to it.

Checks:

```
cd frontend && npm run lint && npm run build && npm test
cd backend && npm run typecheck && npm test
```

## Screenshots

```
cd frontend && npm run shots
```

This builds the app if needed, starts a preview server on a spare port, drives the installed Microsoft Edge in headless mode and writes PNGs to `frontend/shots` (git ignored). The customer app is captured at 390 px wide, the dashboard, numbers and map at 1440 px wide. Add shot names after `--` to render only some, and `--build` to force a build. Set `EDGE_PATH` if Edge is not in a standard location.

## URL parameters

Any state opens directly. Parameters apply on load, are not saved and are not sent to other tabs. Unknown values are ignored.

| Parameter | Meaning | Example |
| --- | --- | --- |
| `scenario` | `household-maes` or `bakery-leuven` | `/app?scenario=bakery-leuven` |
| `stage` | `whisper`, `forming` or `ready` | `/app?stage=forming` |
| `confirmed` | `1` once the signal is confirmed | `/app?stage=ready&confirmed=1&open=1` |
| `accepted` | a number N for the first N steps, or step ids | `/app?stage=ready&accepted=3&open=1` |
| `deferred`, `rejected` | step ids | `/app?stage=ready&accepted=epc&deferred=heating&rejected=solar&open=1` |
| `open` | `1` opens the energy radar card instead of the home screen | `/app?stage=ready&open=1` |
| `partner` | partner shown first on the dashboard | `/partner?stage=ready&accepted=6&partner=Setle` |
| `tools` | `0` hides the demo tools and the access field | `/app?tools=0` |

Any decision implies a confirmed signal. `/partner` and `/partner/numbers` accept the same `scenario`, `stage` and `accepted` parameters and build their leads from that state, without the backend or a key.

## Numbers

All estimates, assumptions and per product conversion rates live in `frontend/src/data/synthetic.json`, and the slides use the same file. KBC value leads with conversion into its own products. Partner commission is a secondary line and only exists for some partners.

## Unfinished

- Partner names and roles are assumptions, no partner has agreed to anything.
- Legal and grant statements in `backend/data/facts.json` are marked `verified: false` and have not been checked against official sources.
- The step status flow after acceptance is not built.
- Withdrawing an intent after it was sent is not built, undo and start over only clear decisions kept on this device.
- Most of the KBC Mobile frame is for the look only, only the intent card and the Start tab lead anywhere.
- The container build and the single process serving are left as they are and have had no further work.
