# Chapter 02 validation: Routing and Request Dispatch

Date: 2026-08-30  
Slice: T-601  
Result: Passed

## Scope

- Publish Chapter 02 as a complete seven-section lesson.
- Add executable TypeScript examples for path matching and method dispatch.
- Preserve Chapters 03–06 in the launch catalog as clearly labeled coming-next entries.
- Prevent unfinished chapters from resolving as published lessons or appearing in progress totals.

## Primary-source review

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html): request method and target semantics, 404, 405, and the required `Allow` response field.
- [Node.js URL API](https://nodejs.org/api/url.html): parsing relative request targets with the WHATWG URL API.
- [Node.js HTTP API](https://nodejs.org/api/http.html): `IncomingMessage` request method and URL boundaries.
- [Node.js asynchronous context tracking](https://nodejs.org/api/async_context.html): request-scoped propagation with `AsyncLocalStorage.run()`.
- [Express routing guide](https://expressjs.com/en/guide/routing/): framework routing vocabulary checked against the chapter's framework-independent model.

## Automated evidence

`npm run check` passed after implementation:

- strict TypeScript: passed;
- ESLint with zero warnings: passed;
- Vitest: 5 files, 24 tests passed;
- production Vite build: passed;
- hosting verification: 6 tests passed.

The routing example tests cover literal-over-parameter precedence, parameter decoding, 404, 405 with allowed methods, HEAD-to-GET dispatch, and malformed percent encoding.

## Browser evidence

Verified in the Codex in-app browser against the local Vite server:

- desktop catalog shows two published lessons and four non-linked coming-next chapters;
- Chapter 02 renders all seven sections, code samples, debugging checklist, primary references, and previous-chapter navigation;
- the 375 px viewport has no horizontal overflow on catalog or lesson routes;
- mobile contents drawer opens and exposes the chapter navigation;
- Vite error overlay: absent;
- console warnings and errors: zero.

Final result: passed.
