# KBC MISSION — From Opportunity to Outcome
## Build-ready concept and implementation brief | Tectonic Hackathon Finals / KBC

**Status:** Recommended single direction for the team to approve, not a claim that KBC lacks such a product.  
**Pitch line:** **"KBC already sees your business. Mission helps you deliver what comes next."**  
**One-sentence product:** A permission-based coordination layer that detects an upcoming business opportunity, checks whether the business can safely deliver it, brings the right KBC services and external partners together, adapts when a partner fails, and verifies the outcome.

## 1. Why THIS concept

The judges' actual challenge (Finals Guide pp. 8–9): *"Design a scalable ecosystem that helps customers move from intent to successful action."* The required elements are early signals, understanding context, KBC and partners, user control, measurable outcomes, a credible triple win, scalability and privacy.

### How we combined our three sources of thinking

- **Previous team's KBC Life Context Engine:** Take the concepts of explainable deterministic signals, opt-in data use, separated customer/adviser roles, audit logs and a shared API. The previous project recognised events, but stopped mainly at detection/recommendations. **Do not assume old source code may be reused:** finals rules require development during the official event; confirm with organisers before reusing any earlier code.
- **Claude / Ripple, Cliff Radar, Quote Lens, Intent Exchange:** Keep a confirmed event → visible plan → user-approved action → partner feedback loop. Use deadlines as early signals (Cliff Radar) and a confirmed quote/order as documentary evidence (Quote Lens principle). The partner is a real participant in the simulated workflow, not an advertisement. **Do not build Street Pool or 3 entry flows for this MVP.**
- **Team transcript (~29 minutes):** The team liked the prior event-detection architecture, stressed that the new challenge is the **output**, wanted help *before* a problem occurs, preferred something scalable that works across KBC and partners, and worried about scope, privacy and excessive work for KBC staff. There was **no unanimous final decision** between consumer and business. We choose a narrow business use case now to make one complete action chain.
- **Earlier GPT proposal / KBC NextStep:** A small catering company fulfilling its first large order is concrete, measurable, easy to show in a 3-minute demo and demonstrates a genuine failure/recovery loop.

### Why NOT use solar panels / energy contracts as the main demo

KBC already publicly offers MyHome, renovation plans and market-based estimates via Setle, contractor quotes/tracking via Impact Us Today, proactive energy suggestions via Kate, and group energy purchasing via Switch Together. A consumer demo offering solar quotes, energy advice and pooled group offers risks appearing as a repackaged KBC feature. A neighbourhood **solar INSTALLATION** collective might still be a future innovation, but its privacy, price and partner assumptions would need proof. The team's current time is better used to demonstrate an operational gap: **coordination, dependencies, failures and measured fulfilment.**

Likewise KBC already has Billit, NOWJOBS and Working Capital Insights. **We are NOT selling forecasting or invoicing as new.** The new behaviour is linking them to one customer goal with binding gates and partner-response-driven replanning. Validate with a KBC mentor if this is actually an unsolved gap.

## 2. The user and the concrete early signal

**User:** Nina, owner of a 3-person Belgian catering business.  
**Goal:** Deliver a €12,000 corporate event order on time while never dropping below €3,000 available cash.  
**Trigger:** Her connected invoicing/quote system reports a newly accepted large customer order with a delivery deadline. The bank does not infer future accepted orders from transactions alone. The system sees the need to coordinate cash, people and equipment *before those shortages cause a missed order*.  
**Privacy:** The company explicitly opts in to using relevant banking and connected invoice data for suggestions. The trigger card identifies the source. No third-party request is transmitted until she approves it.

### Working sample data — ALL SYNTHETIC

| Field | Demo value | Meaning |
|---|---:|---|
| Opening cash | €8,000 | Current available business balance |
| Order total | €12,000 | Amount the company expects for completing the job |
| Initial pre-final-payment costs | €9,000 | Food €5,000 + staff €2,500 + equipment €1,500 |
| Minimum reserve set by owner | €3,000 | A hard constraint in planning |
| Forecast low without deposit | **−€1,000** | €8,000 − €9,000; fails reserve by €4,000 |
| Proposed deposit | **40% = €4,800** | Request/approval is NOT cash received |
| Forecast low AFTER deposit arrives | **€3,800** | €8,000 + €4,800 − €9,000 |
| Replacement staffing premium | **+€700** | Original partner cannot supply workers |
| Forecast low after approved replacement | **€3,100** | €8,000 + €4,800 − €9,700; remains above chosen reserve |
| Final payment | **€7,200** | Remaining 60%; only after paid event |
| Closing cash after complete delivery + payment | **€10,300** | €8,000 + €12,000 − €9,700 |
| Order margin before taxes/other overheads | **€2,300** | €12,000 − €9,700; NOT bank revenue |

This is a deliberately simplified illustrative model; dates, VAT, overhead and other obligations must be explicitly labelled omitted from this proof of concept. In the UI, **"forecast"** cannot silently become **"realized"**.

## 3. One complete demo path (must actually work)

**A. Early signal / trust (15–25s).** Nina sees: "New €12,000 event order accepted. Deadline coming. Based on your connected invoice and payment schedule, fulfilling this may put your cash below your €3,000 safety reserve. Want to review?" Buttons: **Review**, **Not now**, **Incorrect**. A small "Why am I seeing this?" expands to data sources and opt-in status. The order event may come from a simulated Billit-like adapter; disclose that.

**B. Mission board / real constraint (20–30s).** Nina confirms her target reserve of €3,000. The plan shows a timeline, upcoming obligations and **−€1,000 projected minimum** with a red risk badge. It's clear that knowing about a large order is not the same as being ready to deliver it. A checklist has dependent steps, not generic product ads. Include **"No loan needed if the deposit is actually paid"**: the bank doesn't push unnecessary credit.

**C. Customer-approved action / deposit (30–40s).** Mission suggests 40% prepayment, and optionally contacting KBC about financing as a fallback, not pre-approving a loan. Nina authorizes creation of a **simulated** deposit invoice. State changes `draft → requested`. Forecast still warns **−€1,000 until payment is RECEIVED**. A demo control simulates confirmed incoming €4,800 transaction. Now plan updates **€3,800 minimum**, and unlocked partner tasks can proceed.

**D. Partner response & adaptation — the signature moment (35–45s).** Nina approves an anonymized availability enquiry for extra staff (NOWJOBS-like partner). Partner panel shows service, time, rough location and task parameters — NOT her account balance or invoice history. Simulate `Partner A: unavailable`. Mission moves the staffing step to **BLOCKED**, suggests `Alternative supplier +€700`, updates projected minimum **€3,100**, and requests Nina's confirmation BEFORE any new obligation. Once confirmed, staffing becomes **BOOKED (simulated)** and status updates to **READY**. If reserve would be under €3,000, mission must prohibit the ready state and explain the new gap.

**E. Verified goal / triple win (25–35s).** In a labelled demo controls panel, simulate delivery confirmed, final invoice generated, final €7,200 payment received. Mission shows **COMPLETED & PAID** ONLY after both events. Show actuals: closing balance €10,300; order margin €2,300. User: avoided taking an unsafe order; partner: one qualified fulfilled staffing job; KBC: engagement + potential bank/partner services, with any commercial revenue explicitly marked as hypothetical, not booked income.

**A real failure branch is mandatory:** partner declines → step blocks → plan recalculates → consent/approval → alternate chosen. This is the core differentiation from a standard chatbot, cross-sell screen or to-do list.

## 4. Four screens, no more

1. **Customer Opportunity**: early event, source + consent, 3 response actions.
2. **Mission Board** (hero screen): goal/financial constraint, forecast timeline, sequential action cards, confirmed vs pending, reason + data used, user approval buttons, live recomputation of amounts.
3. **Partner Operations** (restricted role): only minimally required job information, available/unavailable response, simulated fulfilment status. For internal demo there may be a separately labelled admin "simulate partner" control; do not mix demo powers into the real customer role.
4. **Outcome & Impact**: completed/paid verification and separate, labelled customer/partner/KBC metrics.

A customer dashboard and a narrow partner dashboard are enough. An adviser portal, multiple stories, fancy 3D animations, charts requiring external APIs, live PDF/OCR parsing and chat UI are all out of scope.

## 5. Data model and state machine

Minimum entities:
- `Customer`: customerId, businessName, permission flags, reserveAmount, role.
- `Opportunity`: id, customerId, source, title, orderTotal, eventDate, deadline, expectedFinalPaymentDate, currentStatus.
- `Obligation`: id, opportunityId, kind, amount, dueDate, committed, paymentStatus.
- `Mission`: id, opportunityId, goal, minimumReserve, lifecycle, reasons, forecastMinCash, actualBalance.
- `MissionStep`: id, kind, estimatedCost, status, requiredPreconditions, approvedBy, approvalTime, partnerId.
- `PartnerRequest`: id, missionStepId, minimalPayload, status, partnerResponse, quotedCost.
- `AuditEvent`: id, actor, action, object, timestamp (no secrets or complete account data in log).

Suggested lifecycle (separate event and financial statuses if possible):
`DETECTED → CONFIRMED → AT_RISK → DEPOSIT_REQUESTED → DEPOSIT_RECEIVED → STAFF_REQUESTED → STAFF_UNAVAILABLE → ALTERNATIVE_APPROVED → READY → DELIVERED → PAID → COMPLETED`.

Rules:
- Rejecting detection creates no mission and no partner request.
- A deposit REQUEST doesn't increase available cash; a RECEIVED payment does.
- A partner's unavailable response doesn't create a booking.
- A new cost changes both the margin and cash forecast immediately.
- Only allow `READY` if mandatory actions are complete **and** projected reserve is met.
- Only show `COMPLETED` if delivery **and** remaining customer payment are confirmed.
- Every irreversible external action requires customer approval; repeated clicks must not duplicate requests/invoices.
- No partner can access transaction details or a complete company profile via a client-provided ID.
- All visible demo integrations are **simulations**, not actual KBC/Billit/NOWJOBS APIs unless genuinely connected.

Forecast for simplified demo: starting cash + dated, CONFIRMED receipts − dated, COMMITTED expenses. Calculate a dated cumulative timeline and return the MINIMUM balance, not merely the final total. Present unconfirmed money separately as a scenario only.

## 6. Recommended MVP architecture

- React + Vite frontend; Node.js + Express backend. Same familiar stack as prior project, **but build code during the permitted hackathon slot**. The old project is architectural reference, not a guaranteed reusable submission.
- Seeded synthetic customer/order/event/payment/partner fixtures; JSON or in-memory state is adequate if there is a prominent **Reset Demo** control. SQLite only if trivial and necessary.
- Backend service modules: detection (rules + event dates), forecast engine (pure function), workflow/state transitions (validated), partner simulator, scoped authentication/authorization, audit log.
- REST endpoints may be organized around `GET /api/opportunities`, `POST /api/opportunities/:id/confirm`, `GET /api/missions/:id`, `POST /api/missions/:id/actions`, `GET /api/partner/jobs`, `POST /api/partner/jobs/:id/respond`, `POST /api/demo/reset`, `POST /api/demo/events` (locked to demo admin). Exact route names may change; enforce access control server-side.
- AI is **optional**: deterministic calculations/steps are more trustworthy than an LLM that can invent numbers. If using an LLM, let it ONLY write a human explanation from already computed facts. Never delegate approval, pricing, credit decisions or financial arithmetic to free-form model output.
- Optimise for a reliable hosted preview: a single deployable server serving built frontend or stable two-service setup; persistent demo link; reset; screenshots/video fallback.
- Do not claim access to real bank/customer data or partner APIs; a simulated integration is honest and permitted as a demonstrator if labelled clearly.

### Security essentials (the guide allocates 10%)

Unique secrets in environment variables, no `.env` in GitHub, validation of every request/body, customer/partner/admin server-side roles, ownership checks, no partner visibility into transaction history, explicit sharing consent, audit trail, generic errors, rate limits, CORS allowlist, Helmet/security headers, bounded upload/request sizes, dependency audit and Aikido scan early. The old archived repository contains a populated `backend/.env`; **never paste or commit its credentials into a new repo. Rotate credentials if they were ever shared publicly.**

## 7. Must-pass acceptance tests

1. On first load, customer can see an **upcoming** accepted order with source, not magic mind reading.
2. Customer says "Incorrect/No": no plan or partner request is created.
3. Forecast is −€1,000 before advance; "deposit requested" does NOT improve it.
4. Only confirmed receipt of €4,800 improves minimum forecast to €3,800.
5. A staffing partner fails; job blocks and alternate +€700 changes reserve to €3,100 and margin to €2,300.
6. Extra cost above reserve makes `READY` impossible until a feasible alternative is approved.
7. Partner account cannot fetch the customer's account balances, private order finances or another customer's mission.
8. A double-click on "approve" cannot create two partner requests or deposit invoices.
9. Completed/paid outcome appears only after simulated delivery AND final payment; final cash €10,300.
10. Reset Demo restores initial clean state in <3 seconds, allowing a reliable judge demo.

## 8. Three-minute pitch storyboard (strict)

- **0:00–0:20 — Hook.** "A €12,000 order should be great news. But delivering it can bankrupt your next week." Introduce Nina and the deadline.
- **0:20–0:45 — Anticipation and control.** Signal appears from an accepted order, Nina opts in and confirms the goal.
- **0:45–1:15 — Problem + action.** €8,000 cash vs €9,000 spending: −€1,000. Request advance; only after payment arrives: €3,800 minimum.
- **1:15–2:10 — The memorable failure.** A staffing partner declines; the platform blocks the task, offers replacement +€700, recalculates to €3,100 and obtains Nina's explicit approval.
- **2:10–2:35 — Outcome.** Delivery and remaining payment arrive, mission completed, actual margin €2,300.
- **2:35–3:00 — Triple win + difference.** "Kate can surface a need; KBC Mission helps carry it across services to a verified result." Define user, partner and KBC value and mention scalable rule-based triggers + human approval.

Use few visual slides and a preloaded live demo. Q&A should explicitly explain: what is simulated, what already exists at KBC, what is actually original, when money is counted, consent, and a merchant's right to say no.

## 9. Build order / time budget

**First 10 minutes**: team votes yes/no on this SINGLE scope; ask a KBC representative whether the end-to-end cross-partner coordination exists already and which partner interfaces can be simulated. A negative novelty answer is a pivot trigger, not something to hide.

**First build milestone**: synthetic event + board with correct finance calculations + working consent and action buttons.

**Second milestone**: partner refusal/alternate path with backend state transitions.

**Third milestone**: correct delivered/paid outcome, reset button, simple role separation, access checks, basic automated tests.

**Freeze feature scope at 13:30** (team suggestion). Then security corrections, Aikido scan, demo rehearsal, pitch and backup capture. Aim to submit by 15:30, not 15:59. Official deadline is 16:00. Per guide, final submission cannot be edited and repository must remain public for judging.

### Strict exclusions until complete

No Street Pool, no generic Quote Lens price-estimation feature, no third life-event scenario, no loan underwriting, no actual money transfer, no unsanctioned scraping/integration, no promise of commission amount, no bank-like production claims, no building an entire CRM, no autonomous LLM acting on behalf of customers.

## 10. One question to ask KBC mentor immediately

> "We know KBC already offers Billit, NOWJOBS, and Working Capital Insights. Do you already have a process that connects one confirmed customer order to cash obligations, partner staffing availability, owner approvals, exception recovery and a verified paid outcome? If not, which part is most valuable for you?"

If yes, discover the precise missing part and change the framing. The aim is to build **a differentiated action system**, not another KBC-branded dashboard.

## 11. Submission checklist

Builderbase: short description, presentation **under 3 minutes in PDF or PPT**, GitHub URL, Aikido **final** scan screenshots with repository name and remaining vulnerabilities. Public repo, concise README (what works, how to run, what is simulated or unfinished), all links accessible, no credentials or customer data in code, no edits after final submission.

### Official source checks (public KBC materials)

- Kate can already deliver proactive insurance/energy advice: https://www.kbc.be/retail/en/products/payments/self-banking/on-your-smartphone/mobile/kbc-mobile-faqs/communicatie-contact-acties.html
- KBC MyHome already includes solar panels, renovation quotes and partner tracking: https://www.kbc.be/retail/en/themes/myhome.html
- Switch Together already runs GROUP energy purchases: https://www.kbc.be/retail/en/products/payments/self-banking/partner-ecosystems.html
- Billit integrated invoicing: https://www.kbc.be/business/en/products/making-and-receiving-payments/additional-services/billit-e-invoicing-platform.html
- NOWJOBS partner offer: https://www.kbc.be/business/en/products/making-and-receiving-payments/additional-services/nowjobs-staff.html
- Working Capital Insights already forecasts 90-day cash: https://www.kbc.be/business/en/financing/working-capital/working-capital-insights.html

**Reminder to coding agent:** Don't build everything mentioned as future architecture. Build only the single reliable demo path and failure branch first. Respect hackathon-time build rules and disclose mock integrations.
