# Brainstorm

Notes from the first round of idea work for the KBC challenge.

## What the jury wants

The brief asks for a scalable ecosystem that moves a customer from intent to action, before the customer realises they need help. The customer stays in control, partners get something out of it, and KBC can measure the result. Creativity and pitch quality are 25% each, so the idea has to be easy to explain and different from what the other 15 KBC teams will show.

## Candidate ideas

### Ripple

A life event confirmed by the customer fans out across several KBC domains and becomes one plan, approved step by step. Example: Sofie pays a deposit on an electric car. Within minutes she has a plan for a charging point, the home electricity setup, solar panels and a battery, the right car insurance and a loan if she wants one. She knows about the car. She does not know about the other seven things.

The catalogue already has most of the pieces: electric car loan, electric car insurance, solar and battery calculators, energy loan, group purchase of electricity and gas, energy saving tips.

### First Hire

An entrepreneur pays for their first employee. The plan covers payroll partners, occupational accident insurance, a team protection plan, e-invoicing, collection of unpaid invoices and an investment loan. The same event also reaches the owner's private side: income protection, pension, home insurance. KBC holds both relationships, which most competitors do not.

### Trip Autopilot

A flight payment triggers travel insurance, an eSIM, airport fast lane, parking and currency. Easy to demo, but the most likely idea for other teams to pick, so it stays out.

### Intent Exchange

The customer confirms an intent, KBC publishes it anonymously (budget band, region, timeframe), partners answer with offers and KBC settles. It is the only framing where the partner side is a real product. This is folded into Ripple as the partner screen.

## Direction: Ripple, with changes

KBC acts as the customer's agent. Partners receive a confirmed, anonymous intent and never customer data.

1. Confirm the signal first. Before anything fans out, a card asks "Did you just put a deposit on an electric car?" with yes, no or not now. Nothing is computed or shared until the customer confirms. This answers the question "you watched my transactions?" before it is asked.
2. Every plan includes at least one "not needed" card, based on what the customer already has. A bank that tells you not to buy something is the strongest trust signal we can show.
3. The plan is a board of steps, not a chat. Each step can be accepted, deferred or rejected, and each shows why it appears and which data it used.
4. The partner view is a real screen. A charger installer sees "EV charger, Ghent region, Q4, budget band B" and no name.
5. A numbers page shows the triple win: what the customer saves, what KBC earns and keeps, how many qualified leads each partner gets. Assumptions sit on one slide.
6. Second scenario: First Hire, crossing into the owner's private finances. Same engine, different signal. No third scenario.

## Engine

- Signals come from deterministic rules over transaction categories. Cheap, auditable, and it scales.
- A language model composes the plan, but only from a short list of catalogue entries it is given. Every ID it returns is checked against the catalogue and anything unknown is dropped.
- Plans are generated once per confirmed event, then cached. The two demo scenarios are precomputed, with a live regenerate button as an extra.
- Data is synthetic. We say so on the slide.

## Pitch outline (3 minutes)

1. Fifteen seconds on one person: Sofie, the deposit, seven things to sort out on Monday.
2. The confirm card, then the ripple spreading across three ecosystems.
3. She rejects one step, defers one, and one card says "not needed". The plan still works.
4. The partner screen.
5. The numbers page.
6. Ten seconds on First Hire: same engine, different signal.
7. Close: KBC stops being the shop and becomes the customer's agent.

## Risks

- Looks like another recommender. Mitigation: the partner screen, the "not needed" card and the board layout.
- Privacy questions in Q&A. Mitigation: the confirm step and the data-used line on every card.
- Invented services. Mitigation: catalogue-only output with validation.
- Demo on a machine we do not control. Mitigation: public URL, cached scenarios, a recorded fallback finished by 15:00.
- Scalability questions. Rules detect, the model only writes the plan.
- Security score. Aikido connected early, minimal dependencies, API key only on the server, rate limits on public endpoints.

## Schedule

- 09:30 repository connected to Aikido
- 13:30 scope freeze
- 14:00 Aikido findings fixed
- 15:00 fallback video recorded
- 15:30 submission on Builderbase, half an hour before the deadline

## Roles

- Team lead: final calls, priorities, pitch order.
- Business student: triple-win model, pitch story, slides, timing.
- Security student: Aikido, secrets, dependencies, fixes.
- Coding student: review, manual testing, check on a foreign machine.
