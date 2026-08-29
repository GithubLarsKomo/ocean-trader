# Public deployment legal baseline — Ocean Trader

Reference pattern: `exam-trainer-framework/docs/public-deployment-legal.md` plus its public `impressum.html`, `datenschutz.html`, `legal.css` and legal E2E checks.

## Operator identity

- [x] Operator name: Lars Komorowski.
- [x] Serviceable postal address: Ribeweg 3, 23909 Ratzeburg, Germany.
- [x] Monitored contact email: larskomo@gmx.de.
- [x] Current operator is a private individual; no company/register placeholders are published.

## Mandatory public legal surfaces

- [x] `public/impressum.html` exists and contains completed operator data.
- [x] `public/datenschutz.html` exists and matches the current local-first application model.
- [x] `public/legal.css` is mobile-first and accessible.
- [ ] Production app shell links `Impressum` and `Datenschutz` in one interaction.
- [ ] Both legal pages verified directly by production URL.
- [ ] Mobile acceptance verifies readable legal pages at 360 px width.

## Hosting and data-flow verification

- [x] Hosting provider identified as Hetzner Online GmbH.
- [x] Deployment path is Coolify/reverse proxy.
- [x] Current product architecture is local-first with no account/backend synchronization required for MVP.
- [x] Current product specification forbids mandatory analytics/tracking for core play.
- [ ] Verify Ocean Trader's effective reverse-proxy access-log configuration before final public acceptance.
- [ ] Verify effective Docker/container log rotation for the Ocean Trader deployment before stating quantitative retention values.
- [ ] Confirm whether DNS, CDN, uptime monitoring, error reporting or other providers receive visitor data.
- [ ] Confirm backup location/retention if server-side backups are later enabled.
- [ ] Re-run privacy review before enabling accounts, cloud saves, analytics, multiplayer, external embeds or non-essential cookies.

## Release gate

A public production release is not legally complete until operator identity, hosting/data flows, legal links and deployed legal pages are checked against reality. Templates must never ship with unresolved operator placeholders. Infrastructure retention claims must be evidence-backed rather than copied from another deployment.

This checklist supports engineering completeness and is not a substitute for qualified legal advice where legal review is warranted.
