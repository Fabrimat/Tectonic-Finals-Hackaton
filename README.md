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

- `frontend/` React and Vite single page app, with `frontend/scripts` for screenshots and slides and tests next to the code in `frontend/src`
- `backend/` NestJS API, see `backend/README.md` for endpoints and settings, with `backend/scripts` for the data generators and tests in `backend/src`
- `Dockerfile` builds both and serves them from one process

## Run

```
cd frontend
npm install
npm run dev
```

The app opens on http://localhost:5173. The backend is optional: without it everything runs from the browser, using a precomputed copy of the backend rules (scenarios are cached in both places and a test keeps them aligned). To run it as well, set `PARTNER_API_KEY` (at least 24 characters) in `backend/.env` and start it with `npm run start:dev` in `backend/`. Vite proxies `/api` to it.

Checks:

```
cd frontend && npm run lint && npm run build && npm test
cd backend && npm run typecheck && npm test
```

## Container

The `Dockerfile` has not been built or run on the machine this was written on, so treat these commands as untested. The app writes nothing to disk, so a read-only filesystem should be enough:

```
docker build -t lead-demo .
docker run --read-only --cap-drop ALL --security-opt no-new-privileges -e PARTNER_API_KEY=<at least 24 random characters> -p 3000:3000 lead-demo
```

If something fails on a missing temporary directory, add `--tmpfs /tmp`.

## Screenshots

```
cd frontend && npm run shots
```

This builds the app if needed, starts a preview server on a spare port, drives the installed Microsoft Edge in headless mode and writes PNGs to `frontend/shots` (git ignored). The customer app is captured at 390 px wide, the dashboard, numbers and map at 1440 px wide. Add shot names after `--` to render only some, and `--build` to force a build. Set `EDGE_PATH` if Edge is not in a standard location.

For the slides there is a second command:

```
cd frontend && npm run shots:slides
```

It writes 1920x1080 slides (3840x2160 pixels) and phone compositions to `frontend/shots/slides`, every phone screen as `-screen.png` and as `-framed.png` with a transparent background in `frontend/shots/slides/phones`, and `INDEX.txt` listing each file, its size and the outline slide it belongs to.

The pitch deck has its own command:

```
cd frontend && npm run deck
```

It renders nine 1920x1080 slides from `frontend/scripts/deck` to `frontend/shots/deck` as `deck.pdf`, one PNG per slide in `png/` and `notes.txt` with the speaker notes. The slide set from `npm run shots:slides` is rendered first if it is missing, and the figures on the value slide are read from `frontend/src/data/synthetic.json`.

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
| `partner` | partner shown first on the dashboard, or `all` | `/partner?stage=ready&accepted=6&partner=all` |
| `tools` | `0` hides the demo tools and the access field | `/app?tools=0` |

Any decision implies a confirmed signal. `/partner` and `/partner/numbers` accept the same `scenario`, `stage` and `accepted` parameters and build their leads from that state, without the backend or a key.

## Numbers

All estimates, assumptions and per product conversion rates live in `frontend/src/data/synthetic.json`, and the slides use the same file. KBC value leads with conversion into its own products. Partner commission is a secondary line and only exists for some partners.

## Privacy

Retention, what intents carry and how to remove one are in the Privacy section of `SECURITY.md`.

## Unfinished

- Partner names and roles are assumptions, no partner has agreed to anything.
- Legal and grant statements in `backend/data/facts.json` are marked `verified: false` and have not been checked against official sources.
- The step status flow after acceptance is not built.
- Withdrawing an intent after it was sent is not built, undo and start over only clear decisions kept on this device.
- Most of the KBC Mobile frame is for the look only, only the intent card and the Start tab lead anywhere.
- The container build and the single process serving are left as they are and have had no further work.
