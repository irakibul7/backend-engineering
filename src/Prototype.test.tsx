import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { publishedChapters } from "./content/catalog";
import { loadLesson } from "./content/loadLesson";
import { Prototype } from "./Prototype";

describe("Backend Engineering prototype", () => {
  beforeAll(async () => { await Promise.all(publishedChapters.map((chapter) => loadLesson(chapter.slug))); });
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    document.documentElement.removeAttribute("data-theme");
  });

  it("presents seven published chapters and a visible public roadmap", () => {
    render(<Prototype />);

    expect(screen.getByRole("link", { name: "Backend Engineering home" }).querySelector("img")).toHaveAttribute("src", "/icon-192.png?v=2");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Backend Engineering");
    expect(screen.getByRole("heading", { name: "Launch chapters" })).toBeInTheDocument();
    expect(screen.queryByText("Coming next")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Routing and Request Dispatch" })).toHaveAttribute("href", "/chapters/routing-and-request-dispatch/");
    expect(screen.getByRole("link", { name: "Open Representation and Serialization" })).toHaveAttribute("href", "/chapters/representation-and-serialization/");
    expect(screen.getByRole("link", { name: "Open Layered Request Handling" })).toHaveAttribute("href", "/chapters/layered-request-handling/");
    expect(screen.getByText((_, element) => element?.textContent === "Roadmap (18 topics)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View all 18 roadmap topics/ })).toHaveAttribute("href", "/roadmap/");
  });

  it("starts new readers and moves past completed chapters", async () => {
    const user = userEvent.setup();
    render(<Prototype />);
    expect(screen.getByRole("link", { name: "Start reading" })).toHaveAttribute("href", "/chapters/http-as-a-state-machine/");
    await user.click(screen.getByRole("button", { name: "Mark chapter 1 complete" }));
    expect(screen.getByRole("link", { name: "Start next chapter" })).toHaveAttribute("href", "/chapters/routing-and-request-dispatch/");
    expect(screen.getByRole("link", { name: /Routing and Request Dispatch\s*Path matching/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/chapters completed/)).toBeInTheDocument();
    expect(screen.getByText(/9% of sections read/)).toBeInTheDocument();
  });

  it("resumes a partially read chapter at its first unread section after reload", () => {
    window.localStorage.setItem("backend-engineering:reading-progress:v1", JSON.stringify({schemaVersion: 1, chapterSections: {"http-as-a-state-machine": ["protocol-contract"]}}));
    render(<Prototype />);
    expect(screen.getByRole("link", { name: "Continue reading" })).toHaveAttribute("href", "/chapters/http-as-a-state-machine/#request-lifecycle");
  });

  it("offers the roadmap when all published chapters are complete", async () => {
    const user = userEvent.setup();
    render(<Prototype />);
    for (let n = 1; n <= 7; n++) await user.click(screen.getByRole("button", { name: `Mark chapter ${n} complete` }));
    expect(screen.getByRole("heading", { name: "Foundations complete" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore the roadmap" })).toHaveAttribute("href", "/roadmap/");
  });

  it("keeps Notes keyboard focus inside and restores its opener", async () => {
    const user = userEvent.setup();
    render(<Prototype />);
    const opener = screen.getByRole("button", { name: "Open study notes" });
    await user.click(opener);
    const editor = await screen.findByRole("textbox", { name: "Study notes Markdown editor" });
    await waitFor(() => expect(editor).toHaveFocus());
    const dialog = screen.getByRole("dialog", { name: "Study notes" });
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Close study notes" })).toHaveFocus();
    await user.tab({shift: true});
    expect(editor).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(opener).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("gives every compact weekly streak marker an unambiguous day label and status", () => {
    render(<Prototype />);

    const week = screen.getByRole("list", { name: /current learning streak/ });
    const days = within(week).getAllByRole("listitem");

    expect(days).toHaveLength(7);
    expect(days.map((day) => day.getAttribute("aria-label")?.split(",")[0])).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    expect(days.every((day) => day.getAttribute("title") === day.getAttribute("aria-label"))).toBe(true);
    expect(days.some((day) => day.getAttribute("aria-label")?.endsWith(": completed"))).toBe(true);
  });

  it("opens command search and finds a roadmap topic", async () => {
    const user = userEvent.setup();
    render(<Prototype />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const input = await screen.findByRole("textbox", { name: "Search chapters and topics" });
    await user.type(input, "Kafka");

    expect(screen.getByRole("button", { name: /Messaging and Event Streams/ })).toBeInTheDocument();
  });

  it("navigates search results by keyboard to a published section and restores focus", async () => {
    const user = userEvent.setup();
    render(<Prototype />);
    const opener = screen.getByRole("button", { name: "Search chapters and topics" });
    await user.click(opener);
    const input = await screen.findByRole("textbox", { name: "Search chapters and topics" });
    await user.type(input, "cache");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /Caching as Controlled Staleness/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /HTTP as a State Machine/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(window.location.hash).toBe("#caching");
    expect(window.location.pathname).toBe("/chapters/http-as-a-state-machine/");
    expect(opener).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("contains search focus with no results and closes with its touch control", async () => {
    const user = userEvent.setup();
    render(<Prototype />);
    const opener = screen.getByRole("button", { name: "Search chapters and topics" });
    await user.click(opener);
    const input = await screen.findByRole("textbox", { name: "Search chapters and topics" });
    await user.type(input, "zzzznomatch");
    await user.tab({ shift: true });
    const close = screen.getByRole("button", { name: "Close search" });
    expect(close).toHaveFocus();
    await user.tab();
    expect(input).toHaveFocus();
    await user.click(close);
    expect(opener).toHaveFocus();
  });

  it("tracks completed launch chapters without navigating", async () => {
    const user = userEvent.setup();
    render(<Prototype />);

    await user.click(screen.getByRole("button", { name: "Mark chapter 1 complete" }));

    expect(screen.getByRole("progressbar", { name: "Overall reading progress" })).toHaveAttribute("aria-valuenow", "9");
    expect(screen.getByRole("progressbar", { name: "Overall reading progress" })).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByRole("button", { name: "Reset chapter 1 reading progress" })).toHaveAttribute("aria-pressed", "true");
  });

  it("records section progress when a reader reaches the end of a lesson section", () => {
    let observerCallback: IntersectionObserverCallback | undefined;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
      observe() {}
      disconnect() {}
    });
    window.history.replaceState({}, "", "/chapters/http-as-a-state-machine");
    const { container } = render(<Prototype />);
    const sentinel = container.querySelector('[data-section-read="protocol-contract"]');

    act(() => observerCallback?.([{ isIntersecting: true, target: sentinel } as IntersectionObserverEntry], {} as IntersectionObserver));

    expect(screen.getAllByText("17% read").length).toBeGreaterThan(0);
    expect(JSON.parse(window.localStorage.getItem("backend-engineering:reading-progress:v1") ?? "null")).toMatchObject({
      chapterSections: { "http-as-a-state-machine": ["protocol-contract"] },
    });
    vi.unstubAllGlobals();
  });

  it("cycles and persists the editorial theme", async () => {
    const user = userEvent.setup();
    render(<Prototype />);

    await user.click(screen.getByRole("button", { name: "Switch color theme" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "original");
    expect(window.localStorage.getItem("backend-engineering:preferences:v1")).toContain("original");
  });

  it("sanitizes Markdown when previewing private notes", async () => {
    const user = userEvent.setup();
    const { container } = render(<Prototype />);

    await user.click(screen.getByRole("button", { name: "Open study notes" }));
    await user.type(await screen.findByRole("textbox", { name: "Study notes Markdown editor" }), "# Safe\n\n<script>alert(1)</script>");
    await user.click(screen.getByRole("tab", { name: "Preview" }));

    expect(await screen.findByRole("heading", { name: "Safe" })).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
  });

  it("renders the first lesson title without duplicating its connector", () => {
    window.history.replaceState({}, "", "/chapters/http-as-a-state-machine");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("HTTP as a State Machine");
  });

  it("renders the complete routing chapter with references and a published next link", () => {
    window.history.replaceState({}, "", "/chapters/routing-and-request-dispatch");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Routing and Request Dispatch");
    expect(screen.getByRole("heading", { name: "Separate 404 from 405" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RFC 9110: HTTP Semantics" })).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc9110.html");
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /NextRepresentation and Serialization/ })).toHaveAttribute("href", "/chapters/representation-and-serialization/");
    expect(screen.getByRole("figure", { name: "Route specificity for GET /users/me" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Preserving 404 and 405 during dispatch" })).toBeInTheDocument();
  });

  it("does not expose a roadmap chapter as a lesson", () => {
    window.history.replaceState({}, "", "/chapters/resource-oriented-api-design");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Backend Engineering");
    expect(screen.queryByRole("heading", { level: 1, name: "Resource-Oriented API Design" })).not.toBeInTheDocument();
    expect(screen.queryByText(/approved launch collection/i)).not.toBeInTheDocument();
  });

  it("renders Chapter 04 with three visuals, policy examples, and primary references", () => {
    window.history.replaceState({}, "", "/chapters/identity-authentication-authorization");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Identity, Authentication, and Authorization");
    expect(screen.getByRole("figure", { name: "Four decisions on one request" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "A session changes state over time" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Authorization narrows toward allow" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /Executable authorization matrix/ })).toBeInTheDocument();
    expect(screen.getByText("session-policy.ts")).toBeInTheDocument();
    expect(screen.getByText("authorization.ts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /RFC 8725/ })).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc8725.html");
    expect(screen.getByRole("link", { name: /NextValidation at Trust Boundaries/ })).toHaveAttribute("href", "/chapters/validation-at-trust-boundaries/");
  });

  it("renders Chapter 05 with responsive visuals, validation evidence, and primary references", () => {
    window.history.replaceState({}, "", "/chapters/validation-at-trust-boundaries");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Validation at Trust Boundaries");
    expect(screen.getByRole("figure", { name: "The six questions every request must answer" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Who owns this rejection?" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Trust grows while client authority shrinks" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /Failure ownership/ })).toBeInTheDocument();
    expect(screen.getByText("validation-pipeline.ts")).toBeInTheDocument();
    const requestExample = screen.getByText("incoming-request.json").closest("figure");
    const mentalModel = screen.getByText("Mental model").closest("aside");
    expect(requestExample?.compareDocumentPosition(mentalModel!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText("02 / Parse")).toBeInTheDocument();
    expect(screen.getAllByText("Read diagram as text")[0].closest("details")).not.toHaveAttribute("open");
    expect(screen.getByRole("link", { name: /RFC 9457/ })).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc9457.html");
    expect(screen.getByRole("link", { name: /NextLayered Request Handling/ })).toHaveAttribute("href", "/chapters/layered-request-handling/");
  });

  it("renders Chapter 06 with layered boundaries, responsive visuals, and primary references", () => {
    window.history.replaceState({}, "", "/chapters/layered-request-handling");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Layered Request Handling");
    expect(screen.getByRole("figure", { name: "One request, six ownership boundaries" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Middleware enters inward and unwinds outward" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "Where should this responsibility live?" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /Failure ownership/ })).toBeInTheDocument();
    expect(screen.getByText("publish-document.ts")).toBeInTheDocument();
    expect(screen.getByText("middleware.ts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Node.js: Asynchronous context tracking" })).toHaveAttribute("href", "https://nodejs.org/api/async_context.html");
    expect(screen.getByRole("link", { name: /NextNetworking and Packet Routing/ })).toBeInTheDocument();
  });

  it("renders every diagram type through the shared responsive visual system", () => {
    const routes = [
      ["/chapters/http-as-a-state-machine", "flow"],
      ["/chapters/routing-and-request-dispatch", "decision"],
      ["/chapters/routing-and-request-dispatch", "ladder"],
      ["/chapters/representation-and-serialization", "timeline"],
    ] as const;

    for (const [route, kind] of routes) {
      window.history.replaceState({}, "", route);
      const { container, unmount } = render(<Prototype />);
      expect(container.querySelector(`.lesson-visual--${kind}`)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders the complete serialization chapter with annotated visuals, compatibility table, questions, and references", () => {
    window.history.replaceState({}, "", "/chapters/representation-and-serialization");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Representation and Serialization");
    expect(screen.getByRole("figure", { name: "The representation boundary" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "A compatibility-first schema rollout" })).toBeInTheDocument();
    expect(screen.getByText(/A domain value is mapped to a wire model/i)).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Compatibility matrix for common schema changes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Design questions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /RFC 8259/ })).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc8259.html");
    expect(screen.getByRole("link", { name: /NextIdentity, Authentication, and Authorization/ })).toHaveAttribute("href", "/chapters/identity-authentication-authorization/");
  });

  it("renders two explanatory visuals in the HTTP chapter", () => {
    window.history.replaceState({}, "", "/chapters/http-as-a-state-machine");
    render(<Prototype />);

    expect(screen.getByRole("figure", { name: "Request ownership from client to use case" })).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "A cache freshness decision" })).toBeInTheDocument();
  });
});
