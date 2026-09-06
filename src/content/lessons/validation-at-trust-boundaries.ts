import type { LessonSection } from "../types";

export const validationSections: LessonSection[] = [
  {
    id: "follow-one-request",
    number: "01",
    label: "Start here",
    title: "Follow one request",
    introduction: "Validation is easier to understand when every rule answers a question about the same payload.",
    paragraphs: [
      "Imagine an API that creates a document. The client sends the request below. It looks reasonable, but five details need a decision: extra spaces, uppercase letters, duplicate tags, a numeric string, and a tenant chosen by the client.",
    ],
    code: {
      filename: "incoming-request.json",
      source: `{
  "title": "  API Design  ",
  "slug": "API-Design",
  "tags": ["Backend", "backend"],
  "visibility": "tenant",
  "retentionDays": "30",
  "tenantId": "tenant-b"
}`,
    },
    codeFirst: true,
    visuals: [
      {
        kind: "flow",
        label: "The six questions every request must answer",
        stages: [
          { title: "Can we accept it?", detail: "Check media type and work limits." },
          { title: "Can we read it?", detail: "Parse the representation." },
          { title: "Is the shape right?", detail: "Check fields, types, and ranges." },
          { title: "Should values change?", detail: "Apply explicit normalization rules." },
          { title: "Does it make sense?", detail: "Check domain rules and current context." },
          { title: "May this caller do it?", detail: "Authorize, then commit safely." },
        ],
        alternative: "First check whether the representation is supported and bounded. Then parse it, validate its runtime shape, apply documented normalization, check domain meaning, authorize the caller, and commit under datastore constraints.",
      },
    ],
    callout: {
      label: "Mental model",
      body: "Validation is not one yes-or-no check. It is a sequence of smaller questions, and each question belongs to a different boundary.",
    },
  },
  {
    id: "parsing-is-not-validation",
    number: "02",
    label: "Parse",
    title: "Parsing only means “I can read it”",
    introduction: "Valid JSON can still be the wrong value for your API.",
    paragraphs: [
      "A parser recognizes JSON syntax. It can return an object, array, string, number, Boolean, or null. It does not know that this endpoint expects a document command.",
      "Keep the parsed result as unknown. Writing JSON.parse(text) as DocumentInput changes TypeScript's belief; it does not inspect the value that arrived.",
    ],
    table: {
      caption: "What parsing proves—and what it does not",
      columns: ["Input", "Parses?", "Valid document command?"],
      rows: [
        ["{\"title\":\"API Design\"}", "Yes", "Not yet; required fields are missing"],
        ["[\"API Design\"]", "Yes", "No; the root must be an object"],
        ["{title: API Design}", "No", "No value exists to validate"],
      ],
    },
    callout: {
      label: "Plain-language rule",
      body: "Parse first. Validate the returned unknown value second.",
    },
  },
  {
    id: "three-kinds-of-validation",
    number: "03",
    label: "Rules",
    title: "Check type, syntax, then meaning",
    introduction: "These checks sound similar, but they answer different questions.",
    paragraphs: [
      "Run cheap checks first. There is no reason to test a slug pattern until you know the value is a string. There is no reason to query slug availability until the string has the right format.",
    ],
    table: {
      caption: "Three validation layers using the same slug field",
      columns: ["Layer", "Question", "Example failure"],
      rows: [
        ["Type", "Is slug a string?", "slug: 42"],
        ["Syntax", "Does it match the allowed pattern?", "slug: \"API design!\""],
        ["Meaning", "Is the canonical slug available in this tenant?", "api-design already exists"],
      ],
    },
    checklist: [
      "Type: string, number, Boolean, array, object, or null.",
      "Syntax: length, pattern, range, and collection size.",
      "Meaning: cross-field rules, current state, and domain policy.",
    ],
  },
  {
    id: "transform-with-a-reason",
    number: "04",
    label: "Transform",
    title: "Transform only with a reason",
    introduction: "A transformation is part of the contract because it changes what the client sent.",
    paragraphs: [
      "For this API, trimming the title and lowercasing the slug are documented choices. Converting the string \"30\" into the number 30 is not. Silent coercion makes mistakes look valid.",
      "Validate again after normalization. The two tags in our request become the same value after lowercasing, so the request must report a duplicate instead of silently dropping one.",
    ],
    table: {
      caption: "Do not mix these three operations",
      columns: ["Operation", "Purpose", "Example"],
      rows: [
        ["Normalize", "Give equivalent accepted values one form", "API-Design → api-design"],
        ["Coerce", "Change the runtime type", "\"30\" → 30; reject unless the contract promises it"],
        ["Encode", "Make trusted output safe for a destination", "Escape HTML when rendering, not while validating input"],
      ],
    },
  },
  {
    id: "reduce-client-authority",
    number: "05",
    label: "Authority",
    title: "Let the client control less",
    introduction: "A write contract should list the fields a client may propose—not mirror the database model.",
    paragraphs: [
      "tenantId is well-formed in the example request, but the client is not allowed to choose it. Read tenant, owner, identifiers, and timestamps from trusted server context.",
      "Reject unknown keys and build a fresh command from named properties. Object spread or a recursive merge can accidentally accept server-owned fields and dangerous keys such as __proto__.",
    ],
    visuals: [
      {
        kind: "ladder",
        label: "Trust grows while client authority shrinks",
        request: "title · slug · tags · visibility · retentionDays · tenantId?",
        entries: [
          { rank: "01", pattern: "raw request", result: "Every value is untrusted." },
          { rank: "02", pattern: "strict DTO", result: "Only allowed fields and exact runtime types remain." },
          { rank: "03", pattern: "domain command", result: "Canonical values and cross-field rules have passed." },
          { rank: "04", pattern: "stored record", result: "Trusted context adds tenant, owner, ID, and timestamps.", selected: true },
        ],
        alternative: "The raw request starts with no trust. Structural validation keeps only allowed fields. Domain validation checks canonical values. Finally, trusted server context and storage add tenant, owner, identifiers, timestamps, and authoritative constraints.",
      },
    ],
    callout: {
      label: "Result for our request",
      body: "Reject tenantId as an unknown server-owned field. Never use its value to select the tenant.",
    },
  },
  {
    id: "bound-the-work",
    number: "06",
    label: "Limits",
    title: "Stop oversized work early",
    introduction: "Field rules cannot help after the service has already exhausted memory or CPU.",
    paragraphs: [
      "Choose the parser from an allowlist. Reject an unsupported media type with 415 and content beyond the endpoint budget with 413. Content-Length is only a hint; count the bytes actually received.",
      "Compressed bodies need a limit after decompression. Parsers also need limits for nesting depth, field count, array length, string length, numeric range, and processing time.",
    ],
    checklist: [
      "Allowlist request media types.",
      "Count received and decompressed bytes.",
      "Bound depth, fields, arrays, strings, and parse time.",
      "Stop reading after rejection and release buffers.",
    ],
  },
  {
    id: "place-each-rule",
    number: "07",
    label: "Ownership",
    title: "Put each rule where the evidence exists",
    introduction: "The edge can check a payload. It cannot know every fact required to accept the operation.",
    paragraphs: [
      "A validator can require retentionDays when visibility is tenant. Authorization must decide whether this principal may create tenant-visible documents. The database must preserve slug uniqueness when two requests race.",
      "Validate early for useful feedback, but keep authorization and datastore constraints. Passing one boundary never proves the next one.",
    ],
    visuals: [
      {
        kind: "decision",
        label: "Who owns this rejection?",
        question: "What evidence is needed to make the decision?",
        outcomes: [
          { condition: "Media or size", result: "Transport", detail: "Reject unsupported or excessive input." },
          { condition: "JSON syntax", result: "Parser", detail: "Reject a representation that cannot be decoded." },
          { condition: "Fields and types", result: "Structural validator", detail: "Return stable issue paths and codes." },
          { condition: "Cross-field rule", result: "Domain validator", detail: "Check meaning after shape is known." },
          { condition: "Caller and resource", result: "Authorization", detail: "Decide whether this action is allowed here." },
          { condition: "Concurrent state", result: "Transaction", detail: "Enforce uniqueness and references at commit." },
        ],
        alternative: "Transport owns media and size limits. The parser owns representation syntax. Structural validation owns fields and types. Domain validation owns cross-field meaning. Authorization owns caller-resource access. The transaction owns concurrent state and final uniqueness.",
      },
    ],
  },
  {
    id: "return-useful-errors",
    number: "08",
    label: "Errors",
    title: "Return an error the client can act on",
    introduction: "A good 4xx response says which input failed without exposing sensitive internals.",
    paragraphs: [
      "Use stable machine-readable codes and field paths. Human messages may improve later, so clients should not parse them for control flow.",
      "Do not echo the whole payload, secrets, database details, or authorization reasoning. Log a safe boundary name, issue code, endpoint, and correlation identifier instead.",
    ],
    code: {
      filename: "validation-problem.json",
      source: `{
  "type": "https://backend.therakibul.me/problems/validation",
  "title": "Request validation failed",
  "status": 422,
  "issues": [
    { "path": "$.retentionDays", "code": "invalid-type" },
    { "path": "$.tags[1]", "code": "normalization-conflict" },
    { "path": "$["tenantId"]", "code": "unknown-field" }
  ]
}`,
    },
    table: {
      caption: "Failure ownership and public response guidance",
      columns: ["Failure", "Owner", "Response"],
      rows: [
        ["Unsupported media", "Transport", "415 Unsupported Media Type"],
        ["Content too large", "Transport", "413 Content Too Large"],
        ["Malformed JSON", "Parser", "400 Bad Request"],
        ["Invalid field", "Validator", "422 validation problem"],
        ["Concurrent uniqueness conflict", "Transaction", "409 Conflict"],
      ],
    },
  },
  {
    id: "build-the-pipeline",
    number: "09",
    label: "Pipeline",
    title: "Build one narrow transition at a time",
    introduction: "Each function should accept the last proven type and return the next one.",
    paragraphs: [
      "The runtime boundary starts with unknown. Structural validation returns a DTO. Normalization returns a canonical command. Authorization then combines that command with trusted principal and tenant context.",
    ],
    code: {
      filename: "validation-pipeline.ts",
      source: `export function validateDocumentCommand(
  input: unknown,
): ValidationResult<DocumentCommand> {
  const structural = validateDocumentInput(input);
  if (!structural.ok) return structural;

  return normalizeDocumentInput(structural.value);
}`,
    },
    callout: {
      label: "Why this shape helps",
      body: "A failed result names the boundary that rejected the request. A successful result carries a value that later code can trust for exactly the claims already checked.",
    },
  },
  {
    id: "test-the-boundaries",
    number: "10",
    label: "Verify",
    title: "Test the edges, not only the happy path",
    introduction: "Boundary tests should show what passes, what fails, and which layer owns the failure.",
    paragraphs: [
      "For every limit, test the minimum, maximum, and one value beyond. Include wrong root values, missing and unknown keys, type mismatches, normalization collisions, inherited properties, and server-owned field attempts.",
      "Use integration tests for byte limits, decompression, parser depth, authorization, and database races. Pure validator tests cannot prove behavior owned by those adapters.",
    ],
    checklist: [
      "Accepted output never aliases the caller's arrays or objects.",
      "Normalization is idempotent: running it twice gives the same result.",
      "Unknown and inherited keys never reach the domain command.",
      "Issue order and machine-readable codes stay deterministic.",
      "Public errors contain no raw body, secret, or authorization detail.",
    ],
    questions: [
      "Where should an email's syntax, ownership, and uniqueness each be decided?",
      "Which fields in your write model must never come from the client?",
      "Why can normalization create a duplicate that did not exist before?",
      "Why does a valid tenantId string not authorize access to that tenant?",
      "Which invariants must the transaction still enforce after validation passes?",
    ],
    references: [
      { title: "RFC 9110: HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110.html" },
      { title: "RFC 8259: The JavaScript Object Notation Data Interchange Format", url: "https://www.rfc-editor.org/rfc/rfc8259.html" },
      { title: "RFC 9457: Problem Details for HTTP APIs", url: "https://www.rfc-editor.org/rfc/rfc9457.html" },
      { title: "JSON Schema Draft 2020-12: Validation vocabulary", url: "https://json-schema.org/draft/2020-12/json-schema-validation" },
      { title: "JSON Schema Draft 2020-12: Core vocabulary", url: "https://json-schema.org/draft/2020-12/json-schema-core" },
      { title: "Unicode Standard Annex #15: Unicode Normalization Forms", url: "https://unicode.org/reports/tr15/" },
      { title: "OWASP Input Validation Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html" },
      { title: "OWASP Mass Assignment Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html" },
      { title: "OWASP Prototype Pollution Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html" },
    ],
  },
];
