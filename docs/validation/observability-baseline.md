# Production observability baseline — 2026-08-30

## Instrumentation

- Vercel Web Analytics `2.0.1` is enabled for the production domain and Vercel preview deployments.
- Vercel Speed Insights `2.0.0` is enabled for the same hosts.
- Local development does not mount either client, which keeps local console output clean and avoids sending development activity to production telemetry.
- The production Analytics and Speed Insights scripts respond successfully from `backend.therakibul.me`.

## Live Web Analytics

The production dashboard for the last seven days reported:

| Signal | Baseline |
| --- | ---: |
| Visitors | 3 |
| Page views | 8 |
| Bounce rate | 33% |
| Mobile visitors | 67% |
| Desktop visitors | 33% |

The dashboard recorded the library and both published chapter paths. Traffic is currently from Bangladesh, and the sample is too small for product decisions.

Custom events are not enabled on the current Hobby plan. This is intentional for launch: page views and performance signals are sufficient, and the application does not send search text, reading progress, notes, completion identifiers, or export names to Vercel.

## Live Speed Insights

Desktop field data reported a Real Experience Score of **100 (Great)** from three events. The path-level report correctly attributed those events to `/`. There were no poor or needs-improvement scores.

Mobile and individual Core Web Vitals do not yet have enough real-user events to report values. This is a data-volume limitation, not an instrumentation failure. The earlier synthetic Lighthouse checks remain the launch performance baseline until enough field data arrives.

## Runtime logs

No request logs were present in the inspected time range. The current product is a static Vite deployment with no application API or Vercel Function, so runtime-log volume is expected to be minimal. Browser telemetry and deployment health are the useful production signals for this phase.

## Review thresholds

Review the dashboards again after seven days or after at least 100 Speed Insights events, whichever happens later. Investigate when the 75th percentile exceeds any of these thresholds:

- Largest Contentful Paint: 2.5 seconds
- Interaction to Next Paint: 200 milliseconds
- Cumulative Layout Shift: 0.1
- First Contentful Paint: 1.8 seconds
- Time to First Byte: 800 milliseconds
- Real Experience Score: below 90

Segment by path and device before changing the application. A regression affecting a chapter route should be reproduced on that route rather than inferred from the site-wide average.
