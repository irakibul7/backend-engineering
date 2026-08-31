import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkingPoc } from "./NetworkingPoc";

function installMotionPreference(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

describe("networking observatory proof", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    installMotionPreference(false);
  });

  it("keeps the complete semantic journey available without WebGL", () => {
    render(<NetworkingPoc visualMode="fallback" />);

    expect(screen.getByRole("heading", { level: 1, name: "Two interfaces can exchange one local frame" })).toBeInTheDocument();
    expect(screen.getByTestId("semantic-fallback")).toHaveTextContent("FrameA → B");
    expect(screen.getByTestId("semantic-evidence")).toHaveTextContent("Layer 2 delivers between adjacent interfaces");
    expect(screen.getByRole("img", { name: /3D networking evidence for Hubs and switches/ })).toHaveAttribute("aria-describedby", "current-explanation");
  });

  it("exposes all eight approved networking evidence modules", () => {
    render(<NetworkingPoc visualMode="fallback" />);

    const explorer = screen.getByRole("navigation", { name: "Networking evidence modules" });
    expect(within(explorer).getAllByRole("button")).toHaveLength(8);
    expect(within(explorer).getByRole("button", { name: /Hubs and switches/ })).toBeInTheDocument();
    expect(within(explorer).getByRole("button", { name: /Route repair/ })).toBeInTheDocument();
    expect(within(explorer).getByRole("button", { name: /Internet reachability/ })).toBeInTheDocument();
  });

  it("changes scenarios and preserves complete semantic evidence without WebGL", async () => {
    const user = userEvent.setup();
    render(<NetworkingPoc visualMode="fallback" />);

    await user.click(screen.getByRole("button", { name: /Route repair/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Start with the routes the host already knows");
    expect(screen.getByTestId("semantic-evidence")).toHaveTextContent("198.51.100.0/24");

    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The default route sends the packet the wrong way");
  });

  it("moves through the deterministic journey with the primary controls", async () => {
    const user = userEvent.setup();
    render(<NetworkingPoc visualMode="fallback" />);

    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A hub repeats the signal to every other port");
    expect(screen.getByText("Hubs and switches, step 2: A hub repeats the signal to every other port")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Back/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Two interfaces can exchange one local frame");
  });

  it("synchronizes routed lookup evidence and TTL", async () => {
    const user = userEvent.setup();
    render(<NetworkingPoc visualMode="fallback" />);

    await user.click(screen.getByRole("button", { name: /Routed packet journey/ }));
    await user.selectOptions(screen.getByLabelText("Routed packet journey step"), "4");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("router removes the frame and looks up the destination");
    expect(screen.getByTestId("semantic-evidence")).toHaveTextContent("203.0.113.0/24");

    await user.selectOptions(screen.getByLabelText("Routed packet journey step"), "5");
    expect(screen.getByTestId("semantic-fallback")).toHaveTextContent("BeforeTTL 64");
    expect(screen.getByTestId("semantic-fallback")).toHaveTextContent("AfterTTL 63");
  });

  it("supports arrow-key navigation while the step rail is focused", () => {
    render(<NetworkingPoc visualMode="fallback" />);

    fireEvent.keyDown(screen.getByRole("group", { name: "Evidence steps" }), { key: "ArrowRight" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A hub repeats the signal to every other port");
  });

  it("disables auto-play when the platform requests reduced motion", () => {
    installMotionPreference(true);
    render(<NetworkingPoc visualMode="fallback" />);

    expect(screen.getByRole("button", { name: /Reduce motion/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Auto-play/ })).toBeDisabled();
  });

  it("persists only an explicit motion-reduction preference", async () => {
    const user = userEvent.setup();
    render(<NetworkingPoc visualMode="fallback" />);

    const toggle = screen.getByRole("button", { name: /Reduce motion/ });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("backend-engineering:networking-motion:v1")).toBe('{"version":1,"reduceMotion":true}');
  });
});
