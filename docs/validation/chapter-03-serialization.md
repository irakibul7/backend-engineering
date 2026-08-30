# Chapter 03 validation: Representation and Serialization

Date: 2026-08-30  
Slice: T-602, Chapter 03  
Result: Passed

## Scope

- Publish Chapter 03 as an original eight-section field guide.
- Explain JSON representation limits, explicit round trips, staged decoding, compatibility direction, Protobuf binary evolution, format selection, and production debugging.
- Add an accessible representation-boundary diagram, two semantic tables, four design questions, and primary references.
- Add an executable TypeScript JSON encoder/decoder and cross-boundary tests.
- Preserve Chapters 04–06 as non-linked coming-next entries.

## Primary-source review

- [RFC 8259: JSON](https://www.rfc-editor.org/rfc/rfc8259.html): JSON grammar, UTF-8 interoperability, duplicate object names, and interoperable numeric range.
- [RFC 7493: I-JSON](https://www.rfc-editor.org/rfc/rfc7493.html): duplicate-name prohibition and string representation for integers beyond exact binary64 range.
- [ECMAScript specification: JSON object](https://tc39.es/ecma262/multipage/structured-data.html#sec-json-object): `JSON.stringify` behavior for `undefined`, functions, non-finite numbers, `BigInt`, and `toJSON`.
- [Protocol Buffers encoding](https://protobuf.dev/programming-guides/encoding/): field number, wire type, payload records, and unknown-field skipping.
- [Protocol Buffers proto3 guide](https://protobuf.dev/programming-guides/proto3/): compatible evolution, permanent field identifiers, reserved fields, and unknown-field retention.
- [Protocol Buffers ProtoJSON](https://protobuf.dev/programming-guides/json/): JSON mapping limits and compatibility differences from the binary wire format.

## Automated evidence

- Strict TypeScript: passed.
- ESLint with zero warnings: passed.
- Vitest: 7 files and 39 tests passed.
- Serialization tests: exact `BigInt` and timestamp round trip, malformed JSON, contract rejection, additive unknown fields, and schema-version rejection passed.
- Production build: five canonical route documents generated.
- Initial JavaScript: 86.26 kB gzip, below the 100 kB budget.
- Hosting verification: 12 tests passed.
- Link verification: all five routes, launch assets, and primary technical references returned successful responses; 27 links passed.
- Axe 4.13.0: zero automated violations on the Chapter 03 route.

## Browser evidence

Verified against the local production preview:

- 1280 × 720: complete chapter, sticky contents rail, diagram, tables, code blocks, metadata, and canonical URL rendered with no page overflow.
- 390 × 844: responsive lesson layout and accessible Contents drawer passed with no page overflow.
- 320 × 700: the long chapter title reflows without horizontal page scrolling; wide tables remain contained in keyboard-focusable horizontal regions.
- Error overlay: absent.
- Browser console warnings and errors: zero.

## Review notes

- React components remain module-level and static content does not add fetch waterfalls or new runtime state.
- The new diagram uses visible explanatory text in addition to its visual stages.
- Table scroll regions are keyboard-focusable and have visible focus treatment.
- External references retain safe opener behavior.
- No analytics captures payload examples, reading state, search terms, or notes.

Final result: passed.
