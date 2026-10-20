# Tectonic Hackathon Finals, KBC challenge

Finals day is 20 October 2026 (Vooruit and Wintercircus, Ghent). The team is in the KBC track.

## Repo rules

- Everything is written in English: code, comments, docs, commits, PR text.
- No co-author lines in commits, no generated-by lines in PRs.
- No mention of AI tools anywhere in repo content or git metadata.
- Write like a human developer. No stock phrases, emoji, heavy commenting or decorative formatting. Match the surrounding code.
- Never commit passwords, API keys or confidential data.

## Schedule

- 09:00 hacking starts, lunch at 12:30.
- 16:00 submissions close on Builderbase. No changes after the final submission.
- 16:15 to 17:35 semi-finals in Wintercircus. KBC teams are in rooms 1 and 2. Be in the room 10 minutes before the slot.
- 18:00 finals in Vooruit Theaterzaal. The best KBC team and the best SD Worx team pitch again.
- 19:00 the winner of the 10,000 EUR main prize is announced.

## The challenge

Opportunity: customers often have to recognise a need, compare options and coordinate several providers themselves. KBC wants to be a trusted partner that understands intent, anticipates needs and connects the right services and partners, so customers reach meaningful life or business outcomes.

Challenge: design a scalable ecosystem that helps customers move from intent to successful action.

Guiding question: how can KBC help customers achieve important life and business goals before they realise they need help?

Building blocks: KBC banking, insurance, platforms, data, AI, advisory capabilities and ecosystem partners. We may combine existing capabilities, connect several domains, introduce new partners or imagine new capabilities.

Suggested domains (be bold): energy and sustainability, entrepreneurship and business growth, travel.

## What the solution should do

- Recognise signals of an emerging need, ambition, opportunity or challenge.
- Understand the customer context behind that intent.
- Activate relevant KBC capabilities, channels, expertise and ecosystem partners.
- Guide decisions and actions while the customer stays in control.
- Deliver a measurable outcome and a sustainable triple win for customers, KBC and partners.

## Design principles

- Bold and differentiated, not a minor product improvement.
- Personalised and adaptive, yet scalable to millions of customers.
- Trustworthy, transparent and privacy-conscious.
- Commercially viable for KBC and attractive for participating partners.
- Grounded in a believable customer journey and demonstrated through a proof of concept.

## Product catalogue

KBC_Ecosystems.xlsx lists about 229 KBC products and services in 20 ecosystems, including external partners (Setle, Immoscoop, Q-Park, NMBS, Billit, Encon, Sweco and others) and technical integrations (PSD2, widgets, APIs, Partner Hub, Developer Portal, the Kate assistant). Use it as the source of truth for what KBC offers, so the solution never invents services.

## UI styling

The first-round project at C:\Users\Fabrizio\Repos\tectonic-project is a style reference only. Its code must not be copied or imported, because everything in this repo has to be written during the event. Read its look (customer.css, advisor.css, styles.css, the mockups folder) and rebuild it from scratch.

Palette used there: KBC blue #00a0dc (accent also seen as #0097db), dark navy #003057 or #003665 for headers and text on light surfaces, light blue #dcf2fa for soft fills, page background #f3f6f9, white cards, border #e3e8ee, body text #1d2733, muted text #6b7785, warning #f5a623, alert #e5484d. Font stack: Segoe UI, Roboto, Helvetica, Arial, sans-serif. Mobile-first cards with rounded corners and generous spacing, in the style of the KBC Mobile app.

## Judging

- Creativity, 25%: how original is the idea.
- Pitch quality, 25%: how well it is presented.
- Technical ability, 20%: does it work.
- Fit, 20%: did it solve the challenge.
- Security, 10%: how secure it is, scored from the Aikido scan.

## Pitch constraints

- 3 minutes of pitch plus 5 minutes of questions, strict on time.
- The pitch file is ppt or pdf.
- The demo runs on the organisers' device, not ours. It must work from a public URL with no installation, and a recorded fallback should exist.

## Submission (Builderbase, by 16:00)

- Short description.
- Pitch presentation, under 3 minutes.
- Link to the public GitHub repository, which must stay public until judging ends.
- Screenshots of the final Aikido scan showing the repository name and remaining vulnerabilities.

The README must explain what the project is, how to run it and what is unfinished.

## Security

Aikido is free at app.aikido.dev (sign in with GitHub). Connect the repository early, review the findings, fix them, push and rescan before the deadline.

## Rules

- The project is built during the event only. Existing or deliberately trivial projects are not eligible.
- One submission per team.
- Judges must be able to open every submitted link.
