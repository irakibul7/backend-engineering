export type Principal = Readonly<{
  subjectId: string;
  tenantId: string;
}>;

export type DocumentState = "draft" | "published" | "archived";

export type Document = Readonly<{
  id: string;
  tenantId: string;
  ownerSubjectId: string;
  state: DocumentState;
  publishedAt: number | null;
  version: number;
}>;

export type PublishedDocument = Document & Readonly<{
  state: "published";
  publishedAt: number;
}>;

export type PublishDocumentCommand = Readonly<{
  documentId: string;
  principal: Principal;
  publishAt: number | null;
  signal: AbortSignal;
}>;

export type PublishOutcome =
  | Readonly<{ kind: "published"; document: PublishedDocument }>
  | Readonly<{ kind: "not-found" }>
  | Readonly<{ kind: "forbidden" }>
  | Readonly<{ kind: "invalid-transition"; code: string }>
  | Readonly<{ kind: "conflict" }>;

export type DocumentRepository = Readonly<{
  findById(documentId: string, signal: AbortSignal): Promise<Document | null>;
  save(document: Document, expectedVersion: number, signal: AbortSignal): Promise<"saved" | "conflict">;
}>;

export type PublishDependencies = Readonly<{
  documents: DocumentRepository;
  canPublish(principal: Principal, document: Document): boolean;
  now(): number;
}>;

export type PublishDocument = (command: PublishDocumentCommand) => Promise<PublishOutcome>;

export type DomainPublishResult =
  | Readonly<{ ok: true; document: PublishedDocument }>
  | Readonly<{ ok: false; code: string }>;

export function publishDraft(document: Document, publishedAt: number): DomainPublishResult {
  if (document.state !== "draft") {
    return Object.freeze({ ok: false, code: `cannot-publish-${document.state}` });
  }

  return Object.freeze({
    ok: true,
    document: Object.freeze({
      ...document,
      state: "published" as const,
      publishedAt,
      version: document.version + 1,
    }),
  });
}

export function createPublishDocument(dependencies: PublishDependencies): PublishDocument {
  return async (command) => {
    command.signal.throwIfAborted();
    const document = await dependencies.documents.findById(command.documentId, command.signal);
    command.signal.throwIfAborted();

    if (!document) return { kind: "not-found" };
    if (!dependencies.canPublish(command.principal, document)) return { kind: "forbidden" };

    const transition = publishDraft(document, command.publishAt ?? dependencies.now());
    if (!transition.ok) return { kind: "invalid-transition", code: transition.code };

    const saved = await dependencies.documents.save(transition.document, document.version, command.signal);
    if (saved === "conflict") return { kind: "conflict" };

    return { kind: "published", document: transition.document };
  };
}

export type RequestContext = Readonly<{
  requestId: string;
  traceId: string | null;
  deadline: number;
  signal: AbortSignal;
}>;

export function createRequestContext(context: RequestContext): RequestContext {
  return Object.freeze({ ...context });
}

export type PublishHttpRequest = Readonly<{
  params: Readonly<{ documentId: string }>;
  body: Readonly<{ publishAt: number | null }>;
  principal: Principal;
  context: RequestContext;
}>;

export type PublishHttpResponse = Readonly<{
  status: number;
  body: Readonly<Record<string, string | number | null>>;
}>;

export function createPublishHandler(publishDocument: PublishDocument) {
  return async (request: PublishHttpRequest): Promise<PublishHttpResponse> => {
    const outcome = await publishDocument({
      documentId: request.params.documentId,
      principal: request.principal,
      publishAt: request.body.publishAt,
      signal: request.context.signal,
    });

    switch (outcome.kind) {
      case "published":
        return {
          status: 200,
          body: {
            id: outcome.document.id,
            state: outcome.document.state,
            publishedAt: outcome.document.publishedAt,
          },
        };
      case "not-found":
      case "forbidden":
        return { status: 404, body: { code: "document-not-found" } };
      case "invalid-transition":
        return { status: 409, body: { code: outcome.code } };
      case "conflict":
        return { status: 409, body: { code: "document-version-conflict" } };
    }
  };
}

export type Handler<Request, Response> = (request: Request) => Promise<Response>;

export type Middleware<Request, Response> = (
  next: Handler<Request, Response>,
) => Handler<Request, Response>;

export function composeMiddleware<Request, Response>(
  terminal: Handler<Request, Response>,
  middleware: readonly Middleware<Request, Response>[],
): Handler<Request, Response> {
  return middleware.reduceRight<Handler<Request, Response>>((downstream, current) => {
    return async (request) => {
      let nextCalled = false;
      const guardedNext: Handler<Request, Response> = async (nextRequest) => {
        if (nextCalled) throw new Error("next-called-more-than-once");
        nextCalled = true;
        return downstream(nextRequest);
      };

      return current(guardedNext)(request);
    };
  }, terminal);
}
