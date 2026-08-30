# Launch readiness — 2026-08-30

## Scope

This record covers launch assets and metadata, Vercel telemetry integration, sitemap and robots output, accessibility, responsive behavior, performance, console health, and link integrity for the four public routes.

## Automated gate

- `npm run typecheck`: passed
- `npm run lint`: passed with zero warnings
- `npm run test`: 6 files and 27 tests passed
- `npm run build`: passed; four route-specific HTML documents generated
- `npm run test:hosting`: 12 tests passed
- Initial JavaScript: 80.58 kB gzip, below the 100 kB budget
- Deferred private Markdown preview chunk: 49.21 kB gzip

## Launch assets and discovery

- SVG and 32 px favicons: emitted
- 180 px Apple touch icon: emitted
- 192 px and 512 px install icons: emitted
- Web app manifest: emitted and linked
- 1200 x 630 social-sharing image: emitted
- Unique canonical, Open Graph, Twitter, and JSON-LD metadata: emitted for every public route
- `sitemap.xml`: exactly four canonical public routes; drafts excluded
- `robots.txt`: crawling allowed and canonical sitemap advertised

## Accessibility

`axe-core` 4.13.0 scanned the library, roadmap, HTTP lesson, and routing lesson. Final result: zero automated violations on all four routes. The initial scan identified low-contrast accent and quiet text; the launch palette was corrected before the passing rerun.

## Responsive and console verification

The production preview was checked at 320 x 700, 390 x 844, 768 x 900, and 1280 x 720. The library retained its heading, header, and main content with no horizontal overflow at every width. The routing lesson also had no narrow-screen overflow and exposed its mobile Contents control. Browser logs contained zero warnings and zero errors.

## Lighthouse

| Page and mode | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Library, mobile | 98 | 100 | 100 | 100 | 2.2 s | 0.019 | 0 ms |
| Library, desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 | 0 ms |
| Routing lesson, mobile | 98 | 100 | 100 | 100 | 2.1 s | 0.001 | 0 ms |
| Routing lesson, desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 | 0 ms |

Tests used a local production build so network variance from deployment routing did not affect application performance scores.

## Links

The checker verified all four public routes, every launch asset, sitemap, robots, and the five primary technical references with HTTP 200 responses. The separate portfolio link `https://therakibul.me/` returned HTTP 200 from Vercel when checked against the domain's configured Vercel edge address; this machine's default DNS path intermittently timed out and was not treated as a content defect.

## Production verification

- Git commit `b5cca3e` completed its Vercel production deployment successfully.
- The library, roadmap, both lessons, sitemap, robots, manifest, social cover, favicon, Analytics script, and Speed Insights script return HTTP 200 from `backend.therakibul.me`.
- The live roadmap HTML contains its route-specific title, canonical URL, and Open Graph URL before JavaScript runs.
- A live browser visit rendered the expected heading and canonical URL, loaded both Vercel telemetry scripts, and logged zero console warnings or errors.
- Web Analytics was enabled on the included Hobby plan. Speed Insights was already enabled and its project dashboard is active.

## Search Console

`https://backend.therakibul.me/sitemap.xml` was submitted to the `therakibul.me` domain property on 2026-08-30. Google read it successfully and reported all four canonical pages as discovered.

Final result: passed. No launch-readiness actions remain.
