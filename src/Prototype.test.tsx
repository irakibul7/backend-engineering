import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prototype } from "./Prototype";

describe("Backend Engineering prototype", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    document.documentElement.removeAttribute("data-theme");
  });

  it("presents two published chapters, four coming-next chapters, and a visible public roadmap", () => {
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Backend Engineering");
    expect(screen.getByRole("heading", { name: "Launch chapters" })).toBeInTheDocument();
    expect(screen.getAllByText("Coming next")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Open Routing and Request Dispatch" })).toHaveAttribute("href", "/chapters/routing-and-request-dispatch/");
    expect(screen.queryByRole("link", { name: "Open Representation and Serialization" })).not.toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "Roadmap (18 topics)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View all 18 roadmap topics/ })).toHaveAttribute("href", "/roadmap/");
  });

  it("opens command search and finds a roadmap topic", async () => {
    const user = userEvent.setup();
    render(<Prototype />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const input = screen.getByRole("textbox", { name: "Search chapters and topics" });
    await user.type(input, "Kafka");

    expect(screen.getByRole("button", { name: /Messaging and Event Streams/ })).toBeInTheDocument();
  });

  it("tracks completed launch chapters without navigating", async () => {
    const user = userEvent.setup();
    render(<Prototype />);

    await user.click(screen.getByRole("button", { name: "Mark chapter 1 complete" }));

    expect(screen.getByRole("progressbar", { name: "Overall reading progress" })).toHaveAttribute("aria-valuenow", "46");
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
    await user.type(screen.getByRole("textbox", { name: "Study notes Markdown editor" }), "# Safe\n\n<script>alert(1)</script>");
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

  it("renders the complete routing chapter with references and no unpublished next link", () => {
    window.history.replaceState({}, "", "/chapters/routing-and-request-dispatch");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Routing and Request Dispatch");
    expect(screen.getByRole("heading", { name: "Separate 404 from 405" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RFC 9110: HTTP Semantics" })).toHaveAttribute("href", "https://www.rfc-editor.org/rfc/rfc9110.html");
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("does not expose an unfinished chapter as a lesson", () => {
    window.history.replaceState({}, "", "/chapters/representation-and-serialization");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Backend Engineering");
    expect(screen.queryByRole("heading", { level: 1, name: "Representation and Serialization" })).not.toBeInTheDocument();
    expect(screen.queryByText(/approved launch collection/i)).not.toBeInTheDocument();
  });
});
