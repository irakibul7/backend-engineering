# Test strategy

## Quality gate

One repository command should run the complete fast gate:

1. formatting check;
2. ESLint with zero warnings;
3. strict TypeScript;
4. content/frontmatter validation;
5. unit and component tests;
6. production static build;
7. hosting/status/header tests.

The full gate adds Playwright, accessibility, performance, link, and security checks.

## Test layers

### Schema and content tests

- chapter numbers and slugs are unique and ordered;
- published chapters have required metadata, sections, references, and review dates;
- internal chapter/section/glossary links resolve;
- external links use HTTPS unless explicitly exempted;
- code samples compile or run in isolated fixtures where practical;
- draft content stays out of production search and sitemap;
- prohibited copied attribution/author strings are absent.

### Unit tests

- search tokenization, ranking, aliases, and empty input;
- storage parsing, migration, repair, unknown IDs, and quota errors;
- progress counts and toggles;
- theme resolution and bootstrap serialization;
- Markdown sanitization and URL allowlist;
- export filename and UTF-8 content;
- previous/next chapter derivation;
- metadata and canonical URL generation.

### Component and integration tests

- search dialog focus, keyboard traversal, result activation, Escape, and restoration;
- completion control remains separate from card navigation;
- notes edit/preview/autosave/error/clear/export states;
- theme control and all contrast-dependent variants;
- table of contents active-section behavior;
- code-copy success and clipboard denial;
- mobile drawer focus containment and dismissal.

### Browser tests

Required viewports:

- desktop: 1280 x 720;
- mobile: 390 x 844;
- narrow guardrail: 320 x 700.

Critical journeys:

1. Open catalog, search for caching, keyboard-select the result, and land on the correct section.
2. Mark a chapter complete, reload, verify count/state, then undo.
3. Switch themes, reload, and verify no first-paint mismatch.
4. Write safe and hostile Markdown, preview, reload, export, and clear.
5. Navigate a lesson by desktop contents rail and mobile drawer.
6. Copy a code sample and use previous/next chapter navigation.
7. Load a deep-linked section and use browser back/forward.

Each browser run asserts zero unexpected console warnings/errors and no request containing note or search content.

### Accessibility

- automated axe scan on catalog, search open/results/empty, lesson, contents drawer, notes edit/preview, and all themes;
- manual keyboard path for every control;
- screen-reader labels/state for completion, search results, copy, saving, tabs, drawer, and theme;
- zoom to 200% and reflow at 320 CSS px;
- reduced-motion and high-contrast spot checks;
- heading, landmark, list, table, and link semantics review.

### Security

- OWASP-style XSS payload corpus against note preview;
- unsafe protocols (`javascript:`, malicious data URLs) rejected;
- CSP/header tests against production-like responses;
- dependency audit and secret scan;
- generated asset and Markdown output integrity checks.

### Performance

- Lighthouse mobile budgets: performance >= 95, accessibility >= 95, best practices >= 95, SEO >= 95;
- Core Web Vitals targets from `PERF-002`;
- initial JavaScript <= 100 kB gzip;
- search p95 <= 100 ms for the production index on throttled mobile CPU;
- no layout shift from fonts, theme bootstrap, diagrams, or sticky controls;
- build time and output size recorded as launch evidence.

### Hosting and SEO

- public routes return 200, unknown route returns 404;
- canonical redirect policy is consistent;
- immutable hashed assets and sensible HTML caching;
- required security headers present;
- sitemap contains only published canonical routes;
- robots points to the canonical sitemap;
- manifest, icons, social image, Open Graph, Twitter, and JSON-LD validate;
- no localhost, preview domain, or misspelled production domain in build output.

## Design QA gate

At the end of implementation, compare source and local screenshots side by side at identical desktop and mobile viewports. Review typography, width, spacing, borders, radii, fixed controls, search, notes, contents drawer, theme states, and overflow. `design-qa.md` must end with `final result: passed`; all P0/P1/P2 findings are fixed before handoff.

## Evidence

Launch evidence will record commands, versions, pass counts, browser captures, accessibility output, performance reports, response headers, sitemap URLs, and production verification date. Evidence is committed only when it contains no secrets, personal note content, or transient machine paths.
