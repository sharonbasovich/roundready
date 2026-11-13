# RoundReady

[Try the live synthetic demo](https://sharonbasovich.github.io/roundready/)

The hosted prototype starts with synthetic examples. It does not automatically save your changes or verify physical restocking. For a local copy, use the static-file instructions below.

A fresh, buildless restock dry run for aggregate period-product inventory. Serve this folder with a static local server and open index.html. No installation/build step, external fonts, runtime network requests beyond these static files, backend, accounts, tracking, storage or file import. Nothing is automatically saved; refresh reloads synthetic data. Browser exit warnings are best effort, not guaranteed recovery.

Start with zero packing quantities, check the synthetic cupboard and station counts, explicitly request a proportional suggestion, then change manual quantities. Invalid values remain visible and block the packing preview/download. “Checked for this round” is an operator input, not verification by the application. No product substitution; pending deliveries remain excluded. Optional usage ranges are assumptions in whole units/day, not forecasts. Output is a packing/check preview, not a physical restock record. Download only requests a save; verify the file exists.

Three examples cover limited stock, plentiful cupboard and unchecked stations. Loading replaces inputs only after confirmation when edited. Field nodes are retained during recalculation so the source does not intentionally steal editing focus. Per-field accessible names include station/product context. Bounded cloud-browser checks covered a desktop keyboard edit/recovery path, 320 CSS pixel iframe suggestion and error recovery, and one exact text-file download. These are not physical-device, full-page, screen-reader or OS reduced-motion acceptance. No real program has validated this prototype.

## Baseline and evidence
A paper stock card or spreadsheet can perform the same arithmetic. The intended benefit is making impossible allocations, unknown counts, pending supply and independent product shortfalls visible together, not mathematical novelty or measured time savings. No deployed use, health outcome, forecast accuracy, environmental benefit or social impact has been measured.

Public workflow evidence: [Brandeis restocking gap](https://www.brandeis.edu/enact/news-events/2025-8-10-enact-wgs-menstrual-product-access-collaboration.html), [Southwestern weekly rounds and low-stock reporting](https://www.southwestern.edu/life-at-southwestern/support-services/community-care/the-period-project/), [England DfE monitoring and distribution guidance](https://www.gov.uk/government/publications/period-products-in-schools-and-colleges/period-product-scheme-for-schools-and-colleges-in-england). These establish the workflow, not endorsement or product validation. England-specific guidance is not worldwide legal advice. Use local product-specific safety/storage procedures.

No personal health data, individual usage, identities, private location information or real station records belong in this prototype. Station A/B/C and all quantities are synthetic. AI assistance was used to design, implement and review this fresh InnovateHER candidate; no prior campaign implementation was copied. The live link is a hosted synthetic demonstration, not evidence of operational deployment, real-world impact or a completed event submission. No additional license grant is included.

## Checks
`node --test core.test.js app.test.js` runs the 13 frozen core groups and 13 mock-DOM handler groups. `node --check core.js` and `node --check app.js` validate syntax. The DOM harness proves scoped handlers/model state, not actual browser perception or platform download behavior. Core hash remains the independently reviewed a84195f220487ce9546381a2fe785cea59e7ac23e0146bdb77501a0afe0a980e.

## Startup readiness
The static page begins with disabled actions and a visible loading/JavaScript explanation. Actions become available only after successful initial construction and a valid initial packing preview. Missing scripts or a startup exception retain a no-preview fallback; no timeout or network diagnosis is inferred. Later invalid edits remain normal validation states and keep Download blocked until corrected. Source/VM regression checks cover these startup boundaries; native script-failure rendering has not been verified for this candidate.
