**KBC Ripple — One big order. One coordinated plan.**

Working concept and build brief for the Tectonic finals, 20 October 2026.
Decision proposed after reviewing the supplied ideas, the updated Claude proposal in `message (3).txt`, the additional `KBC_Mission_Claude_Handoff.md`, team transcript, finals guide and the main logic of the previous Life Context Engine. Every addition was considered together with the earlier material. This is a recommendation ready for implementation, not a claim of validated demand or guaranteed originality.

**Brief summary in English**

I propose one product: Ripple helps a small business fulfil a large order by coordinating money, people and timing. The first example is a catering company. The system spots an upcoming cash shortfall, helps request an advance payment and prepare a staffing request. A partner's refusal changes the overall plan. The system finds an available replacement, recalculates the cost, and the business owner confirms the new terms. At the end, order fulfilment, receipt of payment and the actual remaining cash balance are visible.

From Claude and the team, we keep the shared plan, goal confirmation, clear explanations, a separate partner screen and the option to decline an unnecessary service. From my earlier proposals, we take the dependencies between actions, recalculation when things change and verification of the outcome. From the previous project, we take the approach to explaining signals and separating access. We treat the old code as reference material, subject to the finals rules.

Claude's updated idea focuses more clearly on one area — an energy-efficient home — and rightly proposes connecting existing group-buying schemes. I have taken this update into account. But I still choose the business scenario for these finals: its outcome is easier to verify, and the necessary link between money, deadlines and partners is easier to demonstrate in three minutes. This is an assessment of feasibility and how convincing the demo is, not proof of market superiority.

The core version will not cover solar panels, an electric car, group buying or a second scenario. KBC has already publicly described related solutions for home energy and group purchases. Using existing services is allowed and sensible; the system's new behaviour needs to be demonstrated separately. The main Ripple demonstration: a partner's refusal and a more expensive replacement affect the money, available actions and the need for a new approval.

There were different numerical examples in the materials. For development, we keep only one: EUR 8,000 at the start, an order worth EUR 12,000, a reserve of EUR 3,000, an advance of EUR 4,800, expenses of EUR 9,000 before the replacement and EUR 9,700 after it. All other numerical examples from previous responses are not used in this prototype.

Below is the brief in English for the team and Claude. All amounts are for demonstration purposes. No real connection to the bank, Billit or NOWJOBS has currently been confirmed.

**1. Product decision**

Build a prototype that helps a small catering business deliver an unusually large order without committing to a plan that breaches its chosen cash reserve.

The customer goal is: “Deliver this order on time, get paid, and keep at least EUR 3,000 available throughout the illustrated period.”

Ripple connects the order, its payment schedule, staffing requirements and planned expenses in one shared plan. When a partner declines, it blocks the affected step, recalculates the consequences of a replacement, explains the choices and requests approval for changed commitments.

Proposed positioning inside KBC: a workflow that could be reached through Kate or the business banking interface. The prototype is standalone. No current internal KBC integration is implied.

The first customer segment is small catering/event-service businesses facing an order larger than their usual work. The first use case is one order, not an entire company operating system. Expansion to other services or households is a future possibility, not a second implementation today.

**2. Why this version, and what we combined**

| Input | Decision | Reason |
|---|---|---|
| Previous Life Context Engine | Retain explainable signals, access separation and access history as design ideas | Good foundation for customer trust; the old project stops before actual coordination |
| Ripple | Keep one plan, explicit decisions, visible reasons and unnecessary-service avoidance | Makes the product understandable and keeps the customer involved |
| Cliff Radar | Use known order/payment dates to spot trouble before expenses fall due | No need to guess an unknown future life event |
| Quote Lens | Adapt the useful idea of extracting facts from a customer-supplied order; optional after the core flow works | Do not build or claim a market-price benchmark without comparable data |
| First Hire | Keep temporary staffing as a necessary part of fulfilling this order | The useful mechanism belongs in the customer journey; first-ever hiring is not the whole product |
| Intent Exchange | Keep a partner-facing request and response screen with limited data | Partners must do something observable, not appear as logos |
| NextStep / Mission / Bridge proposals | Make dependencies, changed conditions and outcome tracking the core | This is the strongest way to demonstrate movement from intent to successful action |
| Additional Mission Handoff | Keep the explicit refusal-and-replacement demo and its EUR 8,000 / EUR 4,800 numerical example | A single agreed dataset avoids incompatible calculations across multiple briefs |
| Street Pool | Park for a possible later energy scenario | Group buying already exists; it does not help this order enough to justify another subsystem |
| Consumer EV, solar, travel and business/private crossover | Leave out of today's build | More domains would consume time without improving the main proof |

The team's concern about “predicting the future” needs a correction. The brief asks for help before the customer realises they need it. A known order can reveal an unnoticed future funding or staffing problem. We do not need to predict the order itself.

The team's concern about employee workload is valid. Routine cases should progress through customer and partner confirmations. Escalate to a human only for exceptions or a requested banking consultation. Do not assume that adding AI automatically removes human work.

**Assessment of Claude's updated home-energy proposal**

The update improves focus, gives partners clear roles, treats group-buying schemes as existing infrastructure and explicitly labels proposed partnerships as assumptions. Those are useful improvements. Energy remains a plausible future application of the same shared-plan approach; it is not rejected simply because existing services can be reused.

The remaining problems matter for today's implementation:

- “Today none of it turns into action” is too broad: KBC already describes quotation and installation tracking [S1]. State the specific additional workflow, not an absence of all action.
- A mortgage ending establishes a change in scheduled repayments. It does not establish disposable income, an energy need or a decision to replace a car. The owner must confirm priorities and other commitments.
- Energy-payment amounts do not directly establish meter consumption, heating equipment or a suitable renovation sequence. Meter data requires a real authorised source; roof and installation suitability require further inputs and expert checks.
- “Nothing is computed until yes” conflicts with prior detection. Distinguish analysis permission, goal confirmation, partner sharing and acceptance of a paid commitment.
- “Partners never receive a name” is unsuitable for a real installation booking. Limited or aggregated discovery can precede separately authorised sharing of the contact and site details needed to deliver the service.
- Commission, zero acquisition cost, savings and alleged limitations of every group-buying scheme are not verified business facts. Present testable hypotheses and compare actual offers with equivalent scope.
- The proposal still needs dependencies, partner acknowledgements, handling of changed terms and a defined completed outcome. A map, anonymous-interest screen and estimated-savings page do not supply those mechanisms by themselves.

Both household and business versions need these improvements. The business version is selected because a short, dated order gives us simpler measurable constraints and a clear disruption to demonstrate, with fewer engineering and savings assumptions. The original partner-map idea is retained as a compact pitch illustration; it is not a separate product screen.

**3. Existing KBC capabilities and the proposed difference**

Official public sources support these facts:

- KBC already provides home-energy simulations, contractor requests and installation tracking through its solar services and Impact Us Today [S1].
- KBC described a partnership with iChoosr combining solar group purchases and green financing in 2021 [S2]. This is historical evidence that the concept is not new; it does not establish every current commercial detail.
- Working Capital Insights already provides a 90-day projection and alerts about possible cash shortfalls [S3]. A cash-flow chart alone is therefore insufficient differentiation.
- KBC lists Billit and NOWJOBS among its business services [S4]. Billit supports advance invoices based on quotes or orders [S5]. KBC describes NOWJOBS as supporting temporary staffing and its administration [S6].

Our proposed difference is a shared, customer-controlled execution plan across those capabilities: who must confirm what, which obligations are ready, how a changed partner offer affects the whole goal, and what evidence shows completion.

This is a hypothesis to check with the KBC mentor. Public product pages cannot establish that KBC has no similar internal workflow. Do not pitch “the first ever” or “KBC cannot do this.”

**4. One customer story**

Nina runs a small catering business. A EUR 12,000 order has arrived for an event in one week. Its original terms put the full payment after the event. The order is much larger than her recent orders.

Her connected order system has permission to supply this order. Bank data supplies the opening balance and known existing payments. Nina confirms the event date, food/equipment budgets, staffing needs and desired reserve. The bank does not magically know these operational facts from transactions.

An illustrative detection rule is: the order value exceeds three times the median of recent orders, delivery is within 14 days, and the projection with the confirmed costs falls below the chosen reserve. Use editable, synthetic historical order values with a EUR 2,000 median. EUR 12,000 is six times that median. This is a rule, not an “AI confidence” probability.

The first card asks whether Nina wants to check readiness. It explains the sources. “Not now” or “No” produces no partner requests. Existing data-connection and analysis permissions precede this card; confirming the goal is a separate decision.

**5. Exact synthetic example**

All figures below are simplified cash amounts for a fictional demo. They are not actual partner quotes, tax calculations, credit decisions or a full profit forecast. Staffing amounts represent all-in demo cash costs. VAT settlement, taxes, overheads and other obligations are omitted from this short example and must be visibly disclosed. A real forecast requires those inputs and relevant other accounts. This table is the sole numeric source for the prototype; it supersedes the different sample amounts in earlier drafts.

| Relative date | Event | Original cash movement |
|---|---|---:|
| D0 | Opening cash | EUR 8,000 |
| D1 | Possible 40% advance, only if the buyer agrees and pays | EUR 4,800 |
| D2 | Ingredients | -EUR 5,000 |
| D4 | Equipment hire | -EUR 1,500 |
| D7 | Event staffing, initially estimated | -EUR 2,500 |
| D14 | Buyer payment under original terms | EUR 12,000 |

If the advance is received, the D14 payment becomes EUR 7,200. The order total always remains EUR 12,000. Never add the advance on top of the full final payment.

| Scenario | Lowest projected cash | Reserve test against EUR 3,000 | End cash after full payment |
|---|---:|---|---:|
| Original terms, no advance | -EUR 1,000 | Fails by EUR 4,000 | EUR 11,000 |
| EUR 4,800 advance received on D1; original staffing estimate | EUR 3,800 | Passes under the stated assumptions | EUR 11,000 |
| Original provider declines | Not executable: staffing is missing | Do not show ready, even if a provisional forecast exceeds the reserve | Not a completed plan |
| Replacement staffing EUR 3,200 approved and confirmed | EUR 3,100 | Passes with EUR 100 headroom | EUR 10,300 |
| Stress-test replacement staffing EUR 3,500 | EUR 2,800 | Fails by EUR 200; must not show ready | EUR 10,000 |

These are calculations over dated events. They must update from data. Do not hardcode these totals into UI cards. A late advance can fail even if the eventual total cash is adequate.

The EUR 3,000 reserve is Nina's selected constraint, not a bank-certified safe level. EUR 100 headroom in the chosen replacement path is narrow and should be visible. Do not label a passing scenario “risk free.”

**6. Customer flow and the decisive demo moment**

1. The imported order produces a readiness card. Show the order source and date, not a fabricated transaction inference.
2. Nina confirms her goal and reviews editable costs, dates and the reserve.
3. Ripple shows the shortage under original terms and a conditional alternative involving an advance. A financing discussion and revising the order remain possible paths; neither is automatically selected.
4. Nina authorises preparing/sending a simulated advance request and a non-binding staffing enquiry. Each request shows its recipient and shared fields.
5. The simulated buyer accepts revised terms. A separate simulated bank event records actual advance receipt. “Requested,” “agreed,” “invoiced” and “received” must be distinct.
6. The original staffing provider declines the availability request. No binding staffing agreement has yet been made. The staffing step becomes blocked; the plan cannot be marked ready just because its money projection looks sufficient.
7. Ripple shows an available, explicitly simulated replacement for the same scope and dates at EUR 3,200, which is EUR 700 above the original estimate. The minimum projected balance drops from EUR 3,800 to EUR 3,100. Nina sees the EUR 100 headroom and decides whether to proceed.
8. Nina approves the current replacement offer. Only after provider confirmation does staffing become ready. In the stress test, change the replacement to EUR 3,500: the minimum becomes EUR 2,800 and Ripple must keep the plan below-constraint, even after a click. Revising the plan or seeking an appropriate consultation remains possible; it must not invent money.
9. The chosen partner confirms the current offer and schedule. Other required steps progress under their own approvals. The plan records the offer version and evidence.
10. Demo events simulate the expenses, delivered service and remaining buyer payment. Only then can the order show “Completed and paid — demo.” Show the actual minimum and closing balance from those events.

The trust card is conditional: “No new borrowing is required in this illustrated plan if the advance is received on time and the listed costs remain unchanged.” Do not force a “not needed” recommendation without supporting data.

Blocking a step means Ripple does not issue an unapproved request through its own workflow. It does not freeze a customer's bank account or prevent payments elsewhere.

**7. Minimum implementation**

Build three primary views, with customer stages inside the first view:

| View | Must work |
|---|---|
| Customer workspace | Signal explanation; goal/constraint editing; baseline and conditional forecast; action cards; approve/decline/defer; updated-plan review; final outcome |
| Partner workspace | Only the partner's assigned request; permitted service details; submit offer/availability; confirm or decline; visible effect in the customer view |
| Demo/event controls | Separate buyer-agreement and bank-payment events; staffing refusal/replacement; fulfilment/payment events; isolated reset; always clearly marked as simulation |

Use a compact cash timeline, plain task cards and a short change history. Make the active customer's reserve and current blocking issue immediately visible. Avoid a large graph, many dashboards or a generic chat window.

Real inside the prototype: dated arithmetic, dependency checks, permission checks, current-offer approval, partner request records, event handling, shared state and outcome calculation.

Simulated: connection to KBC/Billit/NOWJOBS, buyer payments, actual invoices or job contracts, partner fulfilment and bank operations. The screen and README must say this. A clicked button must not be presented as a real invoice sent or staff booked.

The minimum action set is: request advance terms, prepare demo advance invoice, receive bank event, request staffing quote, approve selected current quote, confirm staffing, track known supplier expenses, confirm delivery, record remaining payment.

Supplier expenses can be confirmed scenario inputs and tracked events. Do not build a third supplier marketplace or payment system today.

**8. Rules that must be enforced**

- Every external-action simulation checks the user's current permission and the request's current state on the server.
- Non-binding enquiries may be prepared before funding arrives. Costly commitments through Ripple wait for their required prerequisites and explicit approval.
- A pending advance belongs only in the “if received” projection. It is not available cash.
- A bank receipt is the source of truth for received cash; invoice status or model text is insufficient.
- On receipt of an advance, replace its pending forecast entry with the actual entry. Do not count both.
- Preserve the remaining order receivable as order total minus actual allocated receipts. Keep payment matching explicit in the demo.
- Material changes to amount, scope, provider or date require a new version and approval. Never silently reuse approval for a cheaper or more expensive substitute.
- Do not cancel existing contracts automatically. In this demo the original staffing enquiry is declined before any booking is made. The replacement is a separate offer requiring approval. If an already accepted commitment changes, show “needs review” rather than pretending it disappeared.
- Repeat clicks and duplicate partner/payment events must not create duplicate requests, receipts or obligations.
- Refusal and withdrawn sharing permission stop future unauthorised sharing. Explain any already-sent information; do not promise to erase a recipient's copy instantly.
- A partner must not receive balances, full transactions, reserve settings, other bids or unrelated orders.
- Missing operational information is displayed as missing and requested from the owner. Do not invent headcount, coverage or hidden expenses.
- Store each event's source, time, relevant plan/request version and whether it was simulated.
- Completion needs both service-delivery evidence and payment evidence in the demo. A request submission is not a completed customer outcome.

**9. Technical guidance for Claude**

Choose one small application and one simple state store. A familiar React interface and Node backend are reasonable for this team; equivalent simple choices are fine. Durable storage is preferable if straightforward. Isolated in-memory demo sessions with an explicit restart/reset limitation are acceptable for the prototype if persistence would delay the core journey. Do not spend the remaining time selecting frameworks or splitting into microservices.

Useful records are: Business, Order, CashEvent, Goal, PlanVersion, Action, PartnerRequest, PartnerOffer, Approval and AuditEvent. Keep customer/business and provider ownership explicit. Use EUR cents as integers and consistently ordered dated events. In a same-day forecast with no settlement ordering, use a conservative expenses-before-unconfirmed-income assumption.

One deterministic calculation produces the cash timeline and minimum balance. Include all required planned expenses, even before commitment, while keeping their estimate/quote/commitment status explicit. A forecast using only committed expenses would wrongly improve when an essential staffing request is declined. Keep its expected cost as unresolved or substitute an explicit replacement scenario; do not treat missing staff as a saving. Distinguish actual receipts from conditional scenario receipts.

One set of state/dependency rules decides whether an action is ready, waiting, needs approval, blocked, rejected or completed. A confirmed partner reservation is not proof of service delivery; retain that distinction in event records.

Reject negative costs where not permitted, impossible dates, invalid event types, cross-business IDs and stale plan versions. Treat actor role as a server-side fact. An arbitrary role selector or client-supplied customer ID is not authorisation.

Keep isolated demo sessions so one visitor's reset or scenario change cannot overwrite another visitor's work. A demo user may be easy to enter, but backend permissions still separate customer, partner and controller actions. No real credentials or customer records are needed.

AI is secondary to the working plan. If time permits, use one server-side model call to extract fields from pasted order text or explain a computed change. Have the user confirm extracted fields. Supply only necessary fields and allowed service identifiers. Validate returned structure and identifiers. Model output cannot change cash, grant approval, choose an unlisted provider or execute an action.

Start with seeded structured data and template explanations. A deterministic offline path must complete the whole demo. Mark cached/template text honestly. Add live AI only after the core path is stable; the brief does not require an expensive model call for every transaction.

Do not build PDF/OCR handling, automatic loan approval, real payments, staff-contract drafting, tax advice, multi-bank account aggregation, voice, a second customer scenario or demand pooling in the first version.

**10. Security and verification**

Connect Aikido to the actual submission repository early. Remediate findings, then scan the final code and capture the required screenshots showing repository name and remaining findings. A scan is one piece of evidence; it does not establish production banking readiness or legal compliance.

Use only synthetic business/customer/partner information. Keep API keys on the server and out of the repository. The old source archive contains nonempty private configuration: do not copy those values into a public submission. Use fresh demo configuration; this observation is not evidence that credentials were previously exposed publicly. Enforce ownership, field-level partner responses and approvals on the backend. Limit inputs and request rates. If AI reads order text, treat embedded instructions as untrusted document content.

Verify the following concrete outcomes before adding optional features:

| Check | Expected result |
|---|---|
| No advance under original terms | Minimum EUR -1,000 |
| Advance requested but not paid | No increase in actual cash; conditional projection stays visibly conditional |
| Advance EUR 4,800 received, staff EUR 2,500 | Minimum EUR 3,800 |
| Original staffing provider declines | Staffing blocks; plan cannot show ready; needed staffing expense does not vanish |
| Replacement EUR 3,200 approved and confirmed | Minimum EUR 3,100; narrow EUR 100 reserve headroom visible |
| Stress-test replacement EUR 3,500 | Minimum EUR 2,800; cannot show ready |
| Final EUR 7,200 payment after the advance | Total customer receipts EUR 12,000; final cash EUR 10,300 in the chosen replacement scenario |
| Advance date moved after ingredients/equipment are due | Timeline changes and may breach reserve before funds arrive |
| Repeated advance event / request click | No duplicate money or partner request |
| Changed offer after an earlier approval | Earlier approval cannot authorise changed terms |
| Partner tries to fetch another business or balance | Server rejects; forbidden fields absent from response |
| Customer declines sharing | No partner request is sent |
| Service delivered but final payment missing | Outcome not marked completed and paid |

Keep tests focused on these money, state and access risks. Do not spend time on a broad testing framework that delays the working demonstration.

**11. Why each party would use it**

| Party | Proposed benefit | Evidence to collect later |
|---|---|---|
| Customer | Fewer uncoordinated tasks; knows what is still unconfirmed; can act on a large order with a visible reserve constraint | Task time, completion rate, reserve breaches, satisfaction |
| KBC | More useful business banking relationship, better prepared requests and relevant financing when required | Incremental retention/usage, service cost per completed journey, suitable product uptake |
| Partners | Requests with a confirmed scope, dates, necessary data and customer decisions | Offer-to-confirmation conversion, handling effort, cancellations |

Start the commercial hypothesis as a service attached to the KBC business relationship. Possible partner remuneration should be linked to completed services and disclosed; actual terms are unknown. Do not invent commissions or claim an acquisition cost of zero. Recommend a no-new-loan path when it meets the customer's requirements.

For a later business case, calculate incremental bank contribution as verified partner revenue plus incremental banking contribution minus compute, support, integration and operating costs. Do not count hypothetical retention uplift as cash revenue or use the order's EUR 12,000 turnover as KBC earnings.

The main pilot metric is the proportion of eligible, opted-in orders delivered and paid within the agreed window while maintaining the selected cash reserve. Also track customer time, partner cancellations and human intervention rate. Compare against an appropriate existing workflow; the demo does not prove improvement.

There is no validated demand study in the supplied files. A short conversation with a relevant business owner or KBC mentor is more valuable now than another round of AI voting.

**12. Scaling without overstating it**

Process authorised order, payment and partner changes as they arrive. Reuse a small number of journey templates. Keep expensive model work optional and restricted to confirmed cases. Use durable events, duplicate protection and business ownership checks.

Partners need an agreed request/response contract: request ID, service scope, offer version, price, dates, status and event ID. Real onboarding, authentication and operational agreements remain future integration work.

Routine cases should not require a banker to click through every task. Human assistance is an exception route. The prototype demonstrates that architecture idea; it does not establish performance at millions of users.

**13. Pitch plan under three minutes**

Target 2:45, leaving a small timing buffer. Use one customer and one disruption.

| Time | What the jury sees |
|---|---|
| 0:00–0:20 | Nina's EUR 12,000 opportunity and the expenses due before payment |
| 0:20–0:45 | Readiness card, source explanation and EUR 3,000 reserve |
| 0:45–1:10 | Conditional advance option; simulated receipt; plan reaches EUR 3,800 minimum |
| 1:10–1:55 | Staffing provider declines; replacement costs EUR 700 more; minimum becomes EUR 3,100; Nina approves and the replacement confirms |
| 1:55–2:15 | Partner's limited view; fulfilled/paid demo events; outcome evidence |
| 2:15–2:35 | Customer, KBC and partner value; what works and what is simulated |
| 2:35–2:45 | One sentence: Ripple coordinates the decisions needed to make the big order happen |

A useful opening in plain English: “Nina has just won a twelve-thousand-euro catering order. Her expenses arrive before her customer's payment. Ripple helps her agree a workable plan — and updates it when the staffing provider cannot help.”

Do not spend the pitch explaining all the abandoned ideas, architecture names or every security control. Keep those for the five-minute Q&A.

Likely questions and answers:

- “Does KBC already forecast cash?” Yes. Our proposed addition connects that forecast to approvals, partner responses and order completion across services.
- “Where does the order come from?” An authorised order connection or a customer-provided document; a labelled simulator today.
- “What if the buyer refuses the advance?” The helpful scenario stays unconfirmed. Ripple shows revision or consultation options and does not pretend the money exists.
- “Is a partner response a real booking?” Only the simulated confirmation in this prototype. Production requires contracted integrations and confirmations from the service provider.
- “Why KBC?” It can combine banking context, a customer relationship and an existing partner ecosystem. The bank still needs permission and operational data from outside banking.
- “Why would the customer trust it?” It shows its assumptions, keeps control over changed commitments and can recommend proceeding without new borrowing.

**14. Delivery plan for the time remaining**

This proposed schedule assumes the team starts around 11:00 Brussels time. It is a working plan, not a record of completed work. If starting later, remove optional extraction and visual extras first.

| By | Deliverable |
|---|---|
| 11:15 | Agree this one story and exact numbers; one teammate checks it with KBC while implementation starts |
| 11:30 | New repository, deployment path, minimal screens and Aikido connected |
| 12:30 | Baseline → advance request → received event → staffing request works end to end |
| 13:15 | Staffing refusal, replacement calculation, current-version approval and result events work |
| 13:30 | Feature freeze; stop adding scenarios and integrations |
| 14:15 | Resolve concrete calculation/access failures and scan findings; complete slides |
| 15:00 | Recorded fallback and static screenshots; test on a fresh browser/device; rehearsed 2:45 pitch |
| 15:30 | Final links, README, final scan evidence and submission ready |
| Before 16:00 | Submit through Builderbase; no code or submission edits after final submission |

Suggested division: implementation lead owns the shared plan; second builder/reviewer owns the partner screen and demo state; business/pitch lead owns the story and value case; Hussein can own the source/assumption check and a bounded security checklist with developer support. If the team is smaller, combine these roles. No single person should wait for “the AI to finish” before starting their part.

If the core is late at 12:30, stop all optional work. Keep the cash timeline, one advance request, one staffing refusal/replacement and one explicit approval. If it is late at 13:30, prioritise making that chain reliable over expanding the interface.

The guide's main text assigns creativity 25%, technical ability 20%, fit 20%, pitch 25% and security 10%. It specifies a three-minute pitch, five minutes of questions, use of the organiser's device, PPT/PDF presentation, public GitHub repository, README and Aikido evidence. The embedded Builderbase screenshot on page 6 shows different weights and a video field. Check the actual submission form with organisers; do not assume the screenshot overrides the written finals instructions.

The guide requires development during the official time slot. The team transcript also says to start from scratch. Use the earlier project as design reference; only reuse its code if organisers explicitly allow it. This brief does not require code reuse.

**15. What to ask KBC now**

Ask one teammate to spend at most five minutes on these questions while the rest starts:

1. “You already offer working-capital forecasts and business partners. Is there an existing workflow that links one order's advance, staffing offers, approvals and completion, and revises the whole plan when a partner changes terms?”
2. “Which part of this journey creates the most customer friction, and is the catering example credible?”
3. “Are labelled partner simulators acceptable for this proof of concept, and do you have any ready-to-use integration or dataset?”

Only a concrete answer that invalidates the customer problem or establishes a substantially identical existing journey should trigger a major pivot. General preference or another attractive idea is not enough to reopen all scope decisions.

**16. Instruction to hand to Claude**

Implement the agreed Ripple prototype from this brief. First produce a minimal end-to-end flow with shared state, synthetic data and deterministic calculations. Follow only the numeric scenarios and acceptance checks above: opening EUR 8,000; advance EUR 4,800; reserve EUR 3,000; initial costs EUR 9,000; replacement costs EUR 9,700; final receipt EUR 7,200. Keep one business story and explicitly simulated integrations. Do not invent services, data access, real bookings, credit approvals, achieved savings or user demand. Do not add solar, cars, pooling, voice, a second story or a general marketplace. Make one partner refusal trigger a replacement, recalculate the whole plan and require new customer approval. Prioritise a working, explainable three-minute demonstration, access separation and final Aikido evidence.

**Sources and limitations**

Supplied sources reviewed: all eight text files in `ideas.zip`, including `hackaton_brainstorm_1_eng.txt` (approximately 28 minutes 39 seconds), the additional updated Claude proposal `message (3).txt`, the additional `KBC_Mission_Claude_Handoff.md`, the 17-page `Tectonic Hackathon - Finals Guide-1.pdf`, and the previous project's README, security/API descriptions and relevant scoring, data, route and customer-interface code. The old application was inspected statically, not run or penetration-tested. Its code calculates rule-based context and supplies guidance/advisor views; its README explicitly describes the customer advisor-contact button as only a confirmation. Do not present it as an existing completed order workflow or reuse its scores as calibrated probabilities.

The ecosystem spreadsheet mentioned in some notes was not present in either supplied archive. Catalogue claims therefore rely on the public official sources below, not an unseen spreadsheet. Source availability is not evidence of available API credentials or permitted hackathon integration.

- [S1 — KBC solar services, partner quotation and installation tracking](https://www.kbc.be/particulieren/nl/lenen/wonen/zonnepanelen-en-thuisbatterij.html), checked 20 October 2026.
- [S2 — KBC/iChoosr solar group-purchase financing announcement](https://developer.kbc.be/nl/news/kbc-bundelt-krachten-met-ichoosr-om-groene-energieleningen-voor-zonnepanelen-te-verstrekken), published 17 June 2021; checked 20 October 2026. Historical rates from this article are not used.
- [S3 — KBC Working Capital Insights](https://www.kbc.be/business/en/financing/working-capital/working-capital-insights.html), checked 20 October 2026.
- [S4 — KBC business extra services](https://www.kbc.be/ondernemen/nl/sleutelmomenten/extra-diensten.html?zone=topnav), checked 20 October 2026.
- [S5 — Billit advance invoices](https://www.billit.eu/nl-be/helpartikelen/inkomsten/offertes/voorschotfacturen/), checked 20 October 2026.
- [S6 — KBC's NOWJOBS service description](https://www.kbc.be/ondernemen/nl/product/betalen-en-betaald-worden/extra-diensten/nowjobs-personeel-zoeken.html), checked 20 October 2026.

All proposed features, rules, business benefits and pilot metrics in this brief are recommendations unless explicitly identified as existing source-backed capabilities. All scenario money, orders, partner offers and delivery/payment outcomes are synthetic.
