import { describe, expect, it, vi } from "vitest";
import {
  composeMiddleware,
  createPublishDocument,
  createPublishHandler,
  createRequestContext,
  publishDraft,
  type Document,
  type DocumentRepository,
  type Middleware,
  type Principal,
  type PublishDocumentCommand,
} from "./layered-request";

const principal: Principal = Object.freeze({
  subjectId: "owner-1",
  tenantId: "tenant-a",
});

const draft: Document = Object.freeze({
  id: "document-7",
  tenantId: "tenant-a",
  ownerSubjectId: "owner-1",
  state: "draft",
  publishedAt: null,
  version: 2,
});

function command(signal = new AbortController().signal): PublishDocumentCommand {
  return Object.freeze({
    documentId: draft.id,
    principal,
    publishAt: null,
    signal,
  });
}

function repository(found: Document | null = draft, saveResult: "saved" | "conflict" = "saved") {
  const findById = vi.fn(async (_documentId: string, signal: AbortSignal) => {
    signal.throwIfAborted();
    return found;
  });
  const save = vi.fn(async (_document: Document, _expectedVersion: number, signal: AbortSignal) => {
    signal.throwIfAborted();
    return saveResult;
  });

  return {
    adapter: { findById, save } satisfies DocumentRepository,
    findById,
    save,
  };
}

const canPublish = (actor: Principal, document: Document) =>
  actor.tenantId === document.tenantId && actor.subjectId === document.ownerSubjectId;

describe("publish-document application boundary", () => {
  it("publishes a permitted draft and saves it once with optimistic version evidence", async () => {
    const store = repository();
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 1_800_000_000_000 });

    await expect(publish(command())).resolves.toEqual({
      kind: "published",
      document: { ...draft, state: "published", publishedAt: 1_800_000_000_000, version: 3 },
    });
    expect(store.save).toHaveBeenCalledOnce();
    expect(store.save).toHaveBeenCalledWith(
      { ...draft, state: "published", publishedAt: 1_800_000_000_000, version: 3 },
      2,
      expect.any(AbortSignal),
    );
  });

  it("returns not-found without attempting a save", async () => {
    const store = repository(null);
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 1 });

    await expect(publish(command())).resolves.toEqual({ kind: "not-found" });
    expect(store.save).not.toHaveBeenCalled();
  });

  it("returns the same forbidden outcome for cross-tenant and non-owner principals", async () => {
    const store = repository();
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 1 });

    await expect(publish({ ...command(), principal: { subjectId: "owner-1", tenantId: "tenant-b" } })).resolves.toEqual({ kind: "forbidden" });
    await expect(publish({ ...command(), principal: { subjectId: "member-2", tenantId: "tenant-a" } })).resolves.toEqual({ kind: "forbidden" });
    expect(store.save).not.toHaveBeenCalled();
  });

  it.each(["published", "archived"] as const)("rejects the %s -> published domain transition", async (state) => {
    const store = repository({ ...draft, state });
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 1 });

    await expect(publish(command())).resolves.toEqual({ kind: "invalid-transition", code: `cannot-publish-${state}` });
    expect(store.save).not.toHaveBeenCalled();
  });

  it("maps an optimistic save race to a conflict outcome", async () => {
    const store = repository(draft, "conflict");
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 1 });

    await expect(publish(command())).resolves.toEqual({ kind: "conflict" });
  });

  it("stops before repository work when the request is already cancelled", async () => {
    const controller = new AbortController();
    controller.abort(new Error("deadline-exceeded"));
    const store = repository();
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 1 });

    await expect(publish(command(controller.signal))).rejects.toThrow("deadline-exceeded");
    expect(store.findById).not.toHaveBeenCalled();
  });

  it("returns the committed result when cancellation arrives after a successful save", async () => {
    const controller = new AbortController();
    const store = repository();
    store.save.mockImplementationOnce(async () => {
      controller.abort(new Error("client-left-after-commit"));
      return "saved";
    });
    const publish = createPublishDocument({ documents: store.adapter, canPublish, now: () => 10 });

    await expect(publish(command(controller.signal))).resolves.toMatchObject({ kind: "published" });
  });

  it("keeps the domain transition pure and leaves the source document unchanged", () => {
    const result = publishDraft(draft, 10);

    expect(result).toEqual({ ok: true, document: { ...draft, state: "published", publishedAt: 10, version: 3 } });
    expect(draft).toEqual({ ...draft, state: "draft", publishedAt: null, version: 2 });
  });
});

describe("transport handler", () => {
  it("maps one accepted request to one application command and one response", async () => {
    const publish = vi.fn(async () => ({ kind: "published", document: { ...draft, state: "published", publishedAt: 10, version: 3 } } as const));
    const handler = createPublishHandler(publish);
    const context = createRequestContext({ requestId: "request-1", traceId: "trace-1", deadline: 20, signal: new AbortController().signal });

    await expect(handler({ params: { documentId: draft.id }, body: { publishAt: null }, principal, context })).resolves.toEqual({
      status: 200,
      body: { id: draft.id, state: "published", publishedAt: 10 },
    });
    expect(publish).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenCalledWith({ documentId: draft.id, principal, publishAt: null, signal: context.signal });
  });

  it.each([
    [{ kind: "not-found" }, 404, "document-not-found"],
    [{ kind: "forbidden" }, 404, "document-not-found"],
    [{ kind: "invalid-transition", code: "cannot-publish-archived" }, 409, "cannot-publish-archived"],
    [{ kind: "conflict" }, 409, "document-version-conflict"],
  ] as const)("maps %j without leaking application internals", async (outcome, status, code) => {
    const handler = createPublishHandler(async () => outcome);
    const context = createRequestContext({ requestId: "request-1", traceId: null, deadline: 20, signal: new AbortController().signal });

    await expect(handler({ params: { documentId: draft.id }, body: { publishAt: null }, principal, context })).resolves.toEqual({
      status,
      body: { code },
    });
  });

  it("lets unexpected failures reach the outer error boundary", async () => {
    const handler = createPublishHandler(async () => { throw new Error("database-password-must-not-leak"); });
    const context = createRequestContext({ requestId: "request-1", traceId: null, deadline: 20, signal: new AbortController().signal });

    await expect(handler({ params: { documentId: draft.id }, body: { publishAt: null }, principal, context })).rejects.toThrow("database-password-must-not-leak");
  });
});

describe("middleware and request context", () => {
  it("runs before phases outer-to-inner and after phases inner-to-outer", async () => {
    const events: string[] = [];
    const wrap = (name: string): Middleware<string, string> => (next) => async (request) => {
      events.push(`${name}:before`);
      try {
        return await next(request);
      } finally {
        events.push(`${name}:after`);
      }
    };
    const handler = composeMiddleware(async (request: string) => { events.push("handler"); return request; }, [wrap("outer"), wrap("inner")]);

    await expect(handler("request")).resolves.toBe("request");
    expect(events).toEqual(["outer:before", "inner:before", "handler", "inner:after", "outer:after"]);
  });

  it("allows a middleware to short-circuit without calling downstream work", async () => {
    const terminal = vi.fn(async () => "terminal");
    const stop: Middleware<string, string> = () => async () => "short-circuit";

    await expect(composeMiddleware(terminal, [stop])("request")).resolves.toBe("short-circuit");
    expect(terminal).not.toHaveBeenCalled();
  });

  it("rejects a middleware that calls next more than once", async () => {
    const terminal = vi.fn(async () => "ok");
    const twice: Middleware<string, string> = (next) => async (request) => {
      await next(request);
      return next(request);
    };

    await expect(composeMiddleware(terminal, [twice])("request")).rejects.toThrow("next-called-more-than-once");
    expect(terminal).toHaveBeenCalledOnce();
  });

  it("keeps concurrent request contexts immutable and isolated", async () => {
    const first = createRequestContext({ requestId: "request-a", traceId: "trace-a", deadline: 10, signal: new AbortController().signal });
    const second = createRequestContext({ requestId: "request-b", traceId: "trace-b", deadline: 20, signal: new AbortController().signal });
    const handler = composeMiddleware(async (context: typeof first) => {
      await Promise.resolve();
      return `${context.requestId}:${context.traceId}`;
    }, []);

    await expect(Promise.all([handler(first), handler(second)])).resolves.toEqual(["request-a:trace-a", "request-b:trace-b"]);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(second)).toBe(true);
  });
});
