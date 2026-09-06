import type { LessonSection } from "../types";

export const serializationSections: LessonSection[] = [
  {
    id: "values-stop-at-the-boundary",
    number: "01",
    title: "Values stop at the process boundary",
    introduction: "Memory cannot travel across a socket or survive a process restart. Only bytes cross the boundary, so both sides need an agreed way to recover meaning from them.",
    paragraphs: [
      "Inside one process, an order may contain a bigint, a Date, a map, methods, and references to other objects. None of those runtime properties has an automatic network meaning. A serializer maps selected domain values into a representation; an encoder turns that representation into bytes. The receiver reverses those steps under its own version of the contract.",
      "This chapter assumes familiarity with HTTP messages and request routing. Its promise is narrower: given a value and two independently deployed programs, identify what meaning can be preserved, what can be lost, and which changes can be rolled out safely.",
    ],
    visuals: [
      {
        kind: "flow",
        label: "The representation boundary",
        stages: [
          { title: "Domain value", detail: "Useful runtime types and invariants." },
          { title: "Wire model", detail: "Only fields and meanings in the public contract." },
          { title: "Encoded bytes", detail: "UTF-8 text or a defined binary format." },
          { title: "Parser", detail: "Recovers syntax into an untrusted value." },
          { title: "Validated value", detail: "Checks the contract before domain construction." },
        ],
        alternative: "A domain value is mapped to a wire model, encoded as UTF-8 or binary bytes, parsed by another process, validated, and reconstructed as a new domain value.",
      },
    ],
    callout: {
      label: "First principle",
      body: "Serialization does not move an object. It creates bytes from which another program may construct a new value under a shared contract.",
    },
  },
  {
    id: "json-is-not-your-type-system",
    number: "02",
    title: "JSON is syntax, not your type system",
    introduction: "JSON has objects, arrays, strings, numbers, booleans, and null. Your application almost certainly has more kinds of values and stronger rules.",
    paragraphs: [
      "RFC 8259 defines a deliberately small interchange grammar and requires UTF-8 for JSON exchanged outside a closed ecosystem. It does not define dates, decimal money, 64-bit integer semantics, maps with non-string keys, byte arrays, or class identity. Those meanings belong to the application contract, not to the braces and commas.",
      "Interoperability narrows the grammar further. Object names should be unique because parsers disagree about duplicates. Integers outside the exactly interoperable binary64 range can silently change value, so identifiers and large integer amounts should be encoded as strings when exactness matters.",
    ],
    table: {
      caption: "Common runtime values and deliberate JSON representations",
      columns: ["Domain value", "Wire representation", "Required contract"],
      rows: [
        ["Timestamp", "RFC 3339 string", "Timezone and accepted precision"],
        ["Money", "Integer minor units as a string", "Currency and scale"],
        ["Binary data", "Base64 string", "Alphabet, padding, and size limit"],
        ["Absent value", "Omitted member or null", "The two states must not be conflated"],
      ],
    },
  },
  {
    id: "round-trips-are-designed",
    number: "03",
    title: "Round trips must be designed",
    introduction: "JSON.stringify is deterministic enough for many APIs, but it is not a lossless snapshot of a JavaScript object graph.",
    paragraphs: [
      "ECMAScript specifies that undefined and functions disappear from objects, become null in arrays, and produce no JSON text as top-level values. Non-finite numbers become null. BigInt throws unless the application supplies a conversion, while objects may replace themselves through toJSON. A successful call therefore proves only that text was produced, not that the original meaning survived.",
      "A safer encoder builds a dedicated wire value. The example converts minor units to a decimal string, converts the timestamp explicitly, copies the labels, and includes a schema version. The domain type remains convenient inside the process while the wire type remains portable across it.",
    ],
    code: {
      filename: "serialization.ts",
      source: `type Order = Readonly<{
  orderId: string;
  totalMinor: bigint;
  placedAt: Date;
  labels: readonly string[];
}>;

export function encodeOrder(order: Order): string {
  return JSON.stringify({
    schemaVersion: 1,
    orderId: order.orderId,
    totalMinor: order.totalMinor.toString(10),
    placedAt: order.placedAt.toISOString(),
    labels: [...order.labels],
  });
}`,
    },
  },
  {
    id: "decode-in-stages",
    number: "04",
    title: "Decode untrusted bytes in stages",
    introduction: "Parsing answers whether bytes follow a syntax. Validation answers whether the resulting value follows your contract. Construction gives that validated value domain meaning.",
    paragraphs: [
      "Keep those operations separate so each failure is observable. First enforce transport limits and character encoding. Then parse into unknown, require the expected top-level shape, validate every field, and only then construct Date, BigInt, or domain-specific values. A TypeScript assertion changes the compiler's belief; it does not validate a production payload.",
      "The decoder accepts unknown additive fields but rejects an unsupported schema version. That is one explicit compatibility policy. Another service may reject every unknown member for security or regulatory reasons, but the choice must be documented and tested rather than inherited accidentally from a library default.",
    ],
    code: {
      filename: "decode-order.ts",
      source: `export function decodeOrder(payload: string): DecodeResult {
  let value: unknown;

  try {
    value = JSON.parse(payload);
  } catch {
    return { ok: false, issues: ["Payload is not valid JSON."] };
  }

  if (!isRecord(value)) {
    return { ok: false, issues: ["Payload must be a JSON object."] };
  }

  const issues = validateWireOrder(value);
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: toDomainOrder(value) };
}`,
    },
    checklist: [
      "Bound the number of bytes before parsing.",
      "Parse into unknown rather than asserting a domain type.",
      "Report structural failures without echoing secret payload data.",
      "Construct domain values only after the complete wire value is valid.",
    ],
  },
  {
    id: "schema-evolution",
    number: "05",
    title: "Schema evolution is a deployment problem",
    introduction: "A schema change is safe only when old and new readers can coexist with old and new writers during the rollout you actually use.",
    paragraphs: [
      "Compatibility has direction. Backward compatibility means a new reader can consume old data. Forward compatibility means an old reader can consume new data. Distributed deployments usually need both for a period because instances, queues, caches, and stored records do not change version at the same moment.",
      "Treat the matrix below as a rollout starting point, not a substitute for contract tests. JSON safety depends on required-field and unknown-field policy. Protobuf binary safety depends on stable field numbers and wire types; an API can remain wire-compatible while generated application code still needs changes.",
    ],
    visuals: [
      {
        kind: "timeline",
        label: "A compatibility-first schema rollout",
        phases: [
          { marker: "T1", title: "Expand readers", detail: "Deploy code that accepts both the current and next representation." },
          { marker: "T2", title: "Change writers", detail: "Emit the new field or shape only after tolerant readers are live." },
          { marker: "T3", title: "Observe", detail: "Use contract tests and telemetry to confirm the old shape is no longer required." },
          { marker: "T4", title: "Contract", detail: "Remove the legacy read path and reserve retired identifiers." },
        ],
        alternative: "A safe schema rollout first expands readers, then changes writers, observes mixed-version traffic until the old representation is unused, and only then removes the legacy path.",
      },
    ],
    table: {
      caption: "Compatibility matrix for common schema changes",
      columns: ["Change", "JSON", "Protobuf binary", "Safer rollout"],
      rows: [
        ["Add optional field", "Usually safe if old readers ignore unknown members", "Wire-safe; old readers retain or skip the unknown field", "Deploy readers before writers"],
        ["Rename field", "Breaking when the key changes", "Wire-safe only if the field number stays; generated API still changes", "Read both names, write the old name, then migrate"],
        ["Change number to string", "Breaking without a dual-read period", "Unsafe when the wire type changes", "Add a new field and migrate"],
        ["Remove field", "Conditional on every reader treating it as optional", "Wire-safe, but the number and name must be reserved", "Stop reading, stop writing, then reserve"],
        ["Reuse identifier", "Unsafe because old and new meanings collide", "Never reuse a field number", "Allocate a new identifier"],
      ],
    },
    callout: {
      label: "Rollout rule",
      body: "Expand what readers accept before writers emit the new shape; remove the old shape only after every dependent reader has moved.",
    },
  },
  {
    id: "binary-formats-and-protobuf",
    number: "06",
    title: "Binary does not automatically mean better",
    introduction: "A binary format trades human readability for properties such as compactness, typed fields, and faster generated codecs. The right choice depends on the boundary.",
    paragraphs: [
      "A Protobuf binary message encodes records using a field number, wire type, and payload. The schema supplies the field name and declared type that are absent from the bytes. This lets an older parser skip fields it does not know and makes additive evolution practical, but it also makes field numbers permanent protocol identifiers.",
      "Proto3 preserves unknown binary fields when a message is parsed and serialized again. Those fields can still disappear if the message is converted to JSON or copied field by field. Binary compatibility therefore depends on the entire transformation path, not merely on the first parser accepting the bytes.",
    ],
    checklist: [
      "Choose JSON when inspectability and broad client support dominate.",
      "Choose a schema-first binary format when message volume, typed contracts, and controlled clients justify the tooling.",
      "Version the schema in source control and run compatibility checks in CI.",
      "Reserve deleted Protobuf field numbers and names permanently.",
    ],
  },
  {
    id: "representation-decisions",
    number: "07",
    title: "Choose a representation by constraints",
    introduction: "Format selection is a systems decision involving consumers, evolution, latency, storage lifetime, debuggability, and security—not a benchmark contest.",
    paragraphs: [
      "Start with the least powerful representation that preserves the required meaning. Public HTTP APIs often benefit from JSON's ubiquity. Internal high-volume RPC may benefit from generated Protobuf codecs. Logs need stable, queryable fields. Signed payloads need a canonical byte representation because semantically equivalent JSON texts can have different whitespace or member order.",
      "Record content type, size limits, schema ownership, compatibility direction, unknown-field policy, numeric and timestamp rules, and deprecation process beside the contract. Compression is a separate transport decision; it does not repair an ambiguous schema or make an unsafe change compatible.",
    ],
    checklist: [
      "List every producer, consumer, and stored copy of the representation.",
      "Define maximum message size and nesting depth.",
      "Specify exact encodings for timestamps, money, identifiers, and bytes.",
      "Test old-reader/new-writer and new-reader/old-writer combinations.",
      "Canonicalize before hashing or signing; do not sign incidental JSON output.",
    ],
  },
  {
    id: "debug-the-wire-contract",
    number: "08",
    title: "Debug the wire contract",
    introduction: "When decoded data looks wrong, inspect each transformation boundary before blaming the business logic that consumed it.",
    paragraphs: [
      "Capture content type, byte length, schema version, decoder version, and a bounded correlation identifier. Compare the raw bytes with the declared encoding, reproduce parsing with the same library version, and inspect the first field whose representation differs from the contract. Avoid placing complete bodies in logs; payloads often contain credentials or personal data.",
      "The most useful tests keep fixtures produced by both the current and previous schema. Round-trip tests catch lossy mappings. Golden-byte tests catch unintended encoder changes. Cross-version contract tests catch the rollout failures that unit tests against one version cannot see.",
    ],
    checklist: [
      "Confirm the Content-Type and character encoding match the actual bytes.",
      "Check for truncation, compression, framing, and size-limit failures before parsing.",
      "Compare numeric, timestamp, null, absent, and unknown-field policies.",
      "Reproduce with old and new readers against the same captured fixture.",
      "Log schema identifiers and issue codes, never unrestricted payload bodies.",
    ],
    questions: [
      "Which domain values in your current API cannot round-trip through plain JSON without an explicit mapping?",
      "Can an old reader consume a payload from the next deployment, and how is that claim tested?",
      "What data would be lost if a Protobuf message passed through a JSON intermediary?",
      "Which exact bytes are signed when two equivalent representations use different member ordering?",
    ],
    references: [
      { title: "RFC 8259: The JavaScript Object Notation Data Interchange Format", url: "https://www.rfc-editor.org/rfc/rfc8259.html" },
      { title: "RFC 7493: The I-JSON Message Format", url: "https://www.rfc-editor.org/rfc/rfc7493.html" },
      { title: "ECMAScript specification: JSON object", url: "https://tc39.es/ecma262/multipage/structured-data.html#sec-json-object" },
      { title: "Protocol Buffers: Encoding", url: "https://protobuf.dev/programming-guides/encoding/" },
      { title: "Protocol Buffers: Proto 3 language guide", url: "https://protobuf.dev/programming-guides/proto3/" },
      { title: "Protocol Buffers: ProtoJSON format", url: "https://protobuf.dev/programming-guides/json/" },
    ],
  },
];
