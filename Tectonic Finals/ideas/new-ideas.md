# New ideas

Second round of ideas, kept apart from `brainstorm.md`. None of these use the KBC ecosystems spreadsheet. They are different angles from Ripple, First Hire, Trip Autopilot and Intent Exchange.

## Ideas

### Quote Lens

The customer forwards or photographs a quote: solar panels, kitchen, renovation, car. KBC reads the intent from the document and checks whether the price is in a normal range. Then it adds the related loan, insurance and subsidies, and brings an alternative from a partner.

- No transaction data needed. The customer hands over a document on their own initiative, so control is complete.
- "Your quote is 2,000 euro above market" is a stronger trust signal than a "not needed" card.
- Partners compete on a real, confirmed intent.
- Easy to demo: upload a PDF, watch the board appear.

### Cliff Radar

The signal is the calendar, not a purchase. Examples: fixed mortgage rate ending, energy contract ending, insurance renewal, a child turning 18, retirement in 24 months.

- Deterministic rules over dates. Cheap, auditable, scales.
- Measurable: euros saved against a passive renewal.
- Matches the brief literally: act before the customer notices.

### Street Pool

Neighbours who confirmed the same intent are aggregated anonymously. Forty homes in one area want solar. The installer gives a group price, KBC handles payments and finances whoever wants it. Extends Intent Exchange. The catalogue already has group purchase of electricity and gas.

- A partner product with guaranteed volume.
- Each new member lowers the price for everyone.
- Hard to show live with synthetic data.

### Soft Landing

The signal is an income drop, such as job loss or fewer hours. The plan pauses instalments, renegotiates, cuts subscriptions and points to available benefits. Strong emotional story, sensitive topic, and no lead value for partners.

### Heir Desk

One event (a death in the family) starts the notary, succession, accounts, utilities and insurance. No other team will pick it. Heavy topic for a 3 minute pitch.

### Season Switch

A seasonal business (shop, restaurant, campsite) prepares for peak season: stock, staff, insurance, cash buffer. Reuses the First Hire structure with a different signal.

## Combination (our proposal)

Use Ripple as the engine and give it three ways in. One story carries all three.

1. **Cliff Radar opens it.** Sofie's energy contract ends in 60 days and her home has no solar. A card asks whether she wants to look at options. Nothing happens until she answers.
2. **Quote Lens qualifies it.** She uploads the quote she already got from an installer. KBC reads it, shows that it sits 12% above the going rate and lists what the quote leaves out (battery, insurance, subsidy).
3. **Street Pool closes it.** 38 anonymous neighbours in her area have the same confirmed intent. The group price is lower than her quote. She can join, keep her own installer, or reject.

The result is one board of steps, each accepted, deferred or rejected, with the "not needed" card and the data-used line kept from the Ripple design.

What each piece adds to the pitch:

- Cliff Radar answers "how do you know before I do" without watching transactions.
- Quote Lens answers "why should I trust you" with a price check against KBC's own interest.
- Street Pool answers "what do partners get" with volume instead of leads.

Second scenario stays as it was: same engine, different signal. Candidate: Cliff Radar on a business (insurance or lease ending) or First Hire.

## Open points

- Which of the three entries is shown live and which is only a slide.
- How the quote is read: a precomputed demo file first, a live upload as an extra.
- Where the market price range comes from. Needs a synthetic reference table and a note on the slide.
- Whether Street Pool counts are real aggregates over the synthetic customers or a fixed demo number.
