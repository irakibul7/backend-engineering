import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Prototype } from "./Prototype";

describe("Backend from First Principles prototype", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    document.documentElement.removeAttribute("data-theme");
  });

  it("presents six launch chapters and a visible public roadmap", () => {
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Backend from First Principles");
    expect(screen.getByText((_, element) => element?.textContent === "6 launch chapters")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The foundations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What comes next" })).toBeInTheDocument();
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

    expect(screen.getByText("1 of 6 completed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark chapter 1 incomplete" })).toHaveAttribute("aria-pressed", "true");
  });

  it("cycles and persists the editorial theme", async () => {
    const user = userEvent.setup();
    render(<Prototype />);

    await user.click(screen.getByRole("button", { name: "Switch color theme" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "original");
    expect(window.localStorage.getItem("bfp:preferences:v1")).toContain("original");
  });

  it("sanitizes Markdown when previewing private notes", async () => {
    const user = userEvent.setup();
    const { container } = render(<Prototype />);

    await user.click(screen.getByRole("button", { name: "Open study notes" }));
    await user.type(screen.getByRole("textbox", { name: "Study notes Markdown editor" }), "# Safe\n\n<script>alert(1)</script>");
    await user.click(screen.getByRole("tab", { name: "Preview" }));

    expect(screen.getByRole("heading", { name: "Safe" })).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
  });

  it("renders the first lesson title without duplicating its connector", () => {
    window.history.replaceState({}, "", "/chapters/http-as-a-state-machine");
    render(<Prototype />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("HTTP as a state machine.");
  });
});
