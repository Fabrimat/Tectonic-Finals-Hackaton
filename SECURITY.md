# Security policy

## Supported versions

Only the current `main` branch is supported. Fixes are made there.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use the "Report a vulnerability" button
under the Security tab of the GitHub repository to open a private report. Include what you found,
how to reproduce it and which part of the app it touches.

Reports are read by the maintainers and answered through the same private thread.

## Privacy

This is a proof of concept with synthetic data. The people, companies, partners and figures in the demo are made up and labelled as such.

- Retention: intents are held in memory only, capped at 1000 (oldest first out) and cleared when the server restarts. Nothing is written to disk.
- Personal data: intents carry no personal data. The payload shape and the value formats of its fields are whitelisted, so names, emails, phone numbers and addresses are rejected with a 400.
- Withdrawal: an intent can be removed with `DELETE /api/intents/:reference`, which needs the partner API key. The frontend does not call it yet.
- Browser storage: the browser keeps demo state only (the chosen scenario and the decisions made in the demo) in local storage. No personal data is stored there.
- Roles: in production KBC would be the controller and partners processors or independent controllers, depending on the contract. Nothing here settles that.
