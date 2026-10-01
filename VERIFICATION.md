# Verification scope

Release prepared on 1 October 2026. The verified analysis code, SQL, results, and dashboard model are preserved. Hash comparisons guard against unintended analysis changes.

## Checked

- The private `Kvngisaac/retail-sales-analysis` repository is published on `main`. All 38 committed file paths and Git blob hashes match the verified release package, including the dashboard model and binary ZIP. The source commit is a fast-forward from the initial repository commit. The ChatGPT Codex Connector installation uses selected-repository access for this repository. Native read/write access is confirmed.
- Both completed portfolio cards and project write-ups point to the same private repository. The study footer also links to it. DOM checks assert the actual repository href, separate placeholder behavior, and safe external-link attributes. Existing filter/modal/dashboard checks continue to pass; all 27 protected source/result/model files retain their pre-publication SHA-256 hashes.

- Original analysis validation reports all 14 reconciliation checks passing.
- Three analysis boundary tests pass.
- A clean rebuild of the unchanged packaged entry point, using the checksum-verified original workbook with Python 3.12.3 / SQLite 3.45.1, reproduces all six published result files byte for byte. The dashboard data model, provenance manifest, and independent SQL controls also reproduce byte for byte under that runtime.
- Dashboard totals pass 258 country/period/measure comparisons with independently generated SQLite controls.
- Complete SKU rankings pass 24 comparisons with SQLite controls.
- Existing SQL report totals pass 234 country/period/measure comparisons.
- DOM event harnesses cover tool/skill filtering, empty/reset states, project write-ups, modal closing/focus, dashboard country/month/measure changes, range normalization, partial-only empty state, month drill-down, and actual CSV Blob/download content.
- JavaScript syntax, local HTML links/assets, labels, duplicate IDs, and downloadable ZIP integrity are checked.
- Sites reports the private production deployment succeeded. The production archive is compared with the verified checkout assets/configuration during publication.
- The saved 1200 × 750 desktop screenshot was inspected. The visible portfolio header, notice, and project filters render correctly. This is a saved publication image, not an interactive browser session or a full-page review.

## Remaining verification gaps

- Live HTTP route/assets/download responses and authenticated navigation have not been independently exercised. Native deployment success verifies publication status rather than every response.
- Native browser interaction, keyboard tab order/modal behavior, mobile layouts, 200% zoom, screen-reader behavior, and cross-browser rendering remain untested. DOM event checks do not establish these behaviors.
- No interactive dashboard screenshot or browser visual review is available. Managed static Sites lack a compatible browser-preview server here, and the required control-browser skill is unavailable.
- The automatic UCI download path has not been re-executed in this release check. Reproduction uses the already-downloaded original workbook, with its checksum validated by the unchanged analysis.
- SQLite 3.53.1 file-backed rebuild compatibility remains unresolved. Rebuild attempts in this workspace failed with missing-table/malformed-database errors, while the same unchanged packaged entry point and workbook pass under SQLite 3.45.1. The analysis code/results were not changed to work around the runtime failure. Other Python/SQLite combinations and a clean Windows installation are untested.
- The portfolio is owner-private. Employer access has not been granted or tested, and the private GitHub repository does not change the site's sharing policy.

The study's source limitations remain documented in its README, including historical coverage, partial final month, duplicate-policy uncertainty, unlinked credits, missing customer identifiers, and a proxy merchandise taxonomy. Passing software checks does not resolve those source limitations.
